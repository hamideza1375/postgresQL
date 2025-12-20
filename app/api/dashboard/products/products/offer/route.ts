import authAdminRoutes from '@/middleware/authAdminRoutes';
import { Product } from '@/models/ProductModel';
import { dbConnect } from '@/utils/dbConnect';
import { NextRequest, NextResponse as res } from 'next/server';

interface OfferData {
    exp: number;
    value: number;
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

// PUT endpoint for updating product offer
export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        await authAdminRoutes();

        const productId = req.nextUrl.searchParams.get('productID');
        if (!productId) {
            return res.json('شناسه محصول مورد نیاز است', { status: 400 });
        }

        // تبدیل productId به عدد برای Sequelize
        const productIdNum = parseInt(productId);
        if (isNaN(productIdNum)) {
            return res.json('شناسه محصول نامعتبر است', { status: 400 });
        }

        const product = await Product.findByPk(productIdNum);
        if (!product) {
            return res.json('این گزینه قبلا از سرور حذف شده', { status: 400 });
        }

        const { exp, value }: OfferData = await req.json();

        // Validate offer values
        if ((exp > 0 && value < 1) || (exp < 1 && value > 0)) {
            return res.json(
                'نمیشود فقط یک کدام از مقادیر زمان یا درصد تخفیف را مشخص کنید', 
                { status: 400 }
            );
        }

        // Update product offer
        product.setDataValue('offer', {
            exp: exp > 0 ? new Date().getTime() + 60000 * 60 * exp : 0,
            value: value || 0
        })

        await product.save();
        return res.json({ message: 'تخفیف با موفقیت به‌روزرسانی شد', dt: product }, { status: 202 });

    } catch (error: any) {
        console.error('Error updating product offer:', error);
        return res.json(
            error?.message || 'خطای سرور در به‌روزرسانی تخفیف', 
            { status: error?.status || 500 }
        );
    }
}

// GET endpoint for retrieving product offer
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        await authAdminRoutes();

        const productId = req.nextUrl.searchParams.get('productID');
        if (!productId) {
            return res.json('شناسه محصول مورد نیاز است', { status: 400 });
        }

        // تبدیل productId به عدد برای Sequelize
        const productIdNum = parseInt(productId);
        if (isNaN(productIdNum)) {
            return res.json('شناسه محصول نامعتبر است', { status: 400 });
        }

        const product = await Product.findByPk(productIdNum, {
            raw: true,
            attributes: ['offer']
        });
        if (!product) {
            return res.json('محصول یافت نشد', { status: 404 });
        }


        if (product.offer?.exp <= 0) {
            return res.json({});
        }

        const { days, hours, minutes, seconds } = calculateRemainingTime(product.offer?.exp);
        
        const timeString = (days > 7 ? `${days}/` : '') + 
                          `${hours.toString().padStart(2, '0')}:` + 
                          `${minutes.toString().padStart(2, '0')}:` + 
                          `${seconds.toString().padStart(2, '0')}`;

        return res.json({
            exp: timeString,
            value: product.offer?.value
        });

    } catch (error: any) {
        return res.json(
            error?.message || 'خطای سرور در دریافت اطلاعات تخفیف', 
            { status: error?.status || 500 }
        );
    }
}

// Helper function to calculate remaining time
function calculateRemainingTime(exp: number): TimeRemaining {
    const countDownDate = new Date(exp).getTime();
    const now = new Date().getTime();
    const distance = countDownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = days > 7 
        ? Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        : Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
}