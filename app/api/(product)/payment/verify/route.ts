import Payment from '@/models/PaymentsModel';
import User from '@/models/UsersModel';
import { dbConnect } from '@/utils/dbConnect';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import ZarinPalCheckout from 'zarinpal-checkout';
import { NextRequest } from 'next/server';

const zarinpal = ZarinPalCheckout.create('00000000-0000-0000-0000-000000000000', true);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const htmlPage1 = generateHtmlPage({ pageTitle: 'پرداخت انجام نشد', status: 'error' });
    const htmlPage2 = generateHtmlPage({
        pageTitle: 'چک کنید پرداخت انجام شده یا خیر',
        h2: 'خطای نامشخص',
        status: 'error'
    });
    const htmlPage3 = generateHtmlPage({ pageTitle: 'خطای نامشخص رخ داد', status: 'error' });
    const headers = new Headers({ 'Content-Type': 'text/html; charset=utf-8' });
    
    try {
        await dbConnect();
        
        // استخراج پارامترهای کوئری از URL
        const url = new URL(req.url);
        const authority = url.searchParams.get('Authority');
        const status = url.searchParams.get('Status');
        
        if (!authority) {
            return new Response(htmlPage1, { status: 400, headers });
        }

        // یافتن پرداخت بر اساس authority با استفاده از Sequelize
        const payment = await Payment.findOne({
            where: { authority },
            attributes: ['id', 'authority', 'price', 'userId', 'productId', 'version', 'RefID', 'success']
        });

        if (!payment) {
            return new Response(htmlPage1, { status: 404, headers });
        }

        // یافتن کاربر با استفاده از Sequelize
        const user = await User.findByPk(payment.userId, {
            attributes: ['id', 'username', 'email', 'products', 'sellerId']
        });

        if (!user) {
            return new Response(htmlPage1, { status: 404, headers });
        }

        // تأیید پرداخت با استفاده از ZarinPal
        const response = await zarinpal.PaymentVerification({
            Amount: payment.price,
            Authority: authority
        });

        if (response.status !== 100 && status === 'OK') {
            return new Response(htmlPage2, { status: 500, headers });
        } else if (response.status !== 100) {
            return new Response(htmlPage3, { status: 500, headers });
        }

        if (status === 'OK') {
            // به‌روزرسانی پرداخت
            payment.RefID = response.refId;
            payment.success = true;
            await payment.save();

            const protocol = req.headers.get('x-forwarded-proto') || 'http';
            const host = req.headers.get('host') || 'localhost';

            // ایجاد صفحه نتیجه پرداخت موفق
            const htmlPage = generateHtmlPage({
                pageTitle: 'پرداخت موفق',
                username: user.username,
                email: user.email,
                price: payment.price,
                title: payment.title,
                RefID: response.refId,
                location: `${protocol}://${host}/product/${payment.productId}`,
                status: 'OK'
            });

            // به‌روزرسانی محصولات کاربر
            const newProduct = { productId: payment.productId, version: payment.version };
            const updatedProducts = [...(user.products || []), newProduct]
            
            // به‌روزرسانی کاربر با Sequelize
            await user.update(
                { products: updatedProducts as [{ productId: string, version: string }] },
                // { where: { id: user.id } }
            );

            // تهیه توکن‌های جدید برای کاربر
            const forUserIdToken = {
                userId: user.id,
                email: user.email,
                products: updatedProducts,
                username: user.username,
            };

            const cookieStore = await cookies();
            const userId = sign(forUserIdToken, 'httpToken');
            cookieStore.set('httpToken', userId, { maxAge: 60 * 1000 * 60 * 24 * 30, httpOnly: true });

            const forToken = {
                username: user.username,
                email: user.email,
                products: updatedProducts,
            };
            const token = sign(forToken, 'token');
            cookieStore.set('token', token, { maxAge: 60 * 1000 * 60 * 24 * 30 });

            return new Response(htmlPage, { status: 200, headers });
        } else {
            return new Response(htmlPage1, { status: 400, headers });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        return new Response(htmlPage1, { status: 500, headers });
    }
}

function generateHtmlPage(payment: { 
    pageTitle: string; 
    status: string; 
    username?: string; 
    email?: string; 
    price?: number; 
    title?: string; 
    RefID?: number; 
    location?: string; 
    h2?: string; 
}) {
    const html = payment.status !== 'error'
        ? `
	  <!DOCTYPE html>
	  <html dir='rtl' >
		 <head>
             <meta charset="UTF-8">
             <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
			<title>${payment.pageTitle}</title>
		 </head>
		 <body style='width:100%;height:100vh;background-color:#eee;display:flex;align-items:center;justify-content:center;overflow:hidden' >
		 <div style="text-align:center;font-family:serif tahoma;font-size:18px;width:330px; height:420px; border:1px solid #ddd;margin:auto;border-radius:4px;box-shadow:1px 1px 2px 5px #ddd2;background-color:#f4f4f4;overflow:auto;max-width:100%;max-height:100vh" >
			<h1 style="color:#33e83a">${payment.pageTitle}</h1>
			<div style='display:flex;align-items:center;justify-content:center;width:100%;gap:3px'><big>نام: </big> <p style='color:#777;' >${payment.username}</p></div>
			<div style='display:flex;align-items:center;justify-content:center;width:100%;gap:3px'><big>ایمیل: </big> <p style='color:#777;' >${payment.email}</p></div>
			<div style='display:flex;align-items:center;justify-content:center;width:100%;gap:3px'><big>عنوان محصول: </big> <p style='color:#777;' >${payment.title}</p></div>
			<div style='display:flex;align-items:center;justify-content:center;width:100%;gap:3px'><big>قیمت: </big> <p style='color:#777;' >${payment.price}</p></div>
			<div style='display:flex;align-items:center;justify-content:center;width:100%;gap:3px'><big>کد پیگیری: </big> <p style='color:#777;' >${payment.RefID}</p></div>
            <div style='height:6px'></div>
            <a href='${payment.location}' style='border:1px solid #09b; border-radius:4px; padding:2px;padding-inline:5px; color: #09b; cursor:pointer;font-size:13px;text-decoration:none'>بازگشت به دوره</Button>
		 </div>
		 </body>
	  </html>`
        : `<!DOCTYPE html>
	  <html>
		 <head>
             <meta charset="UTF-8">
             <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
			<title>${payment.pageTitle}</title>
		 </head>
		 <body>
			<h1 style="color:red;text-align:center;margin-top:2rem" >${payment.pageTitle}</h1>
			<h2 style="color:#444;text-align:center;margin-top:10px" >${payment.h2}</h2>
		 </body>
	  </html>`;
    return html;
}