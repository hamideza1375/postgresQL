import { dbConnect } from '@/utils/dbConnect';
import { decode } from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import ZarinPalCheckout from 'zarinpal-checkout';
import Product from '@/models/ProductModel';
import Payment from '@/models/PaymentsModel';
const zarinpal = ZarinPalCheckout.create('00000000-0000-0000-0000-000000000000', true);

interface JwtPayload {
    userId: string;
    email: string;
    username: string;
    products: Array<{ productId: string; version: string }>;
    isAdmin: boolean;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const headers = new Headers({ 'Content-Type': 'text/html; charset=utf-8' });
    const htmlPage = generateHtmlPage({ pageTitle: 'داده ها به سرور ارسال نشدن دوباره امتحان کنید', status: 'error' });
    const htmlPage2 = generateHtmlPage({ pageTitle: 'شما این دوره را قبلا خریداری کردین', status: 'error' });

    try {
        const { id } = await params;

        await dbConnect();

        // Get the token from cookies and decode it
        const tokenValue = req.cookies.get('httpToken')?.value;
        if (!tokenValue) {
            return Response.redirect(new URL('/login', req.url));
        }

        const decoded = decode(tokenValue, { json: true });
        const _user = decoded as JwtPayload;

        if (!_user) {
            return Response.redirect(new URL('/login', req.url));
        }

        // Find the product by ID using Sequelize
        const product = await Product.findByPk(id, {
            attributes: ['id', 'title', 'price', 'version', 'offer']
        });

        if (!product) {
            return new Response(htmlPage, { status: 429, headers });
        }

        // Check if user already purchased this product
        if (_user.products && _user.products.find(p => p.productId === id)) {
            return new Response(htmlPage2, { status: 429, headers });
        }

        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host') || 'localhost';

        const response = await zarinpal.PaymentRequest({
            Amount: product.price,
            CallbackURL: `${protocol}://${host}/api/payment/verify`,
            Description: product.title
        })

        console.log('-----------------');
        console.log(response.url);
        console.log('-----------------');
        

        if (response.status !== 100) {
            return new Response(htmlPage, { status: 500, headers });
        }

        // Create a new payment record using Sequelize
        await Payment.create({
            version: product.version,
            userId: _user.userId,
            price: product.price,
            title: product.title,
            productId: product.id,
            authority: response.authority,
            RefID: 1,
            success: false, // Default to false until payment is verified
            status: 'pending'
        });

        return Response.redirect(response.url);
    } catch (error) {
        console.error('Payment confirmation error:', error);
        return new Response(htmlPage, { status: 500, headers });
    }
}

function generateHtmlPage(payment: { pageTitle: string; status: string }) {
    return `<!DOCTYPE html>
	  <html>
		 <head>
             <meta charset="UTF-8">
             <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
			<title>${payment.pageTitle}</title>
		 </head>
		 <body>
			<h1 style="color:red;text-align:center" >${payment.pageTitle}</h1>
		 </body>
	  </html>`;
}