// وارد کردن مدل محصولات و ابزار اتصال به پایگاه داده
import ProductsModel from '@/models/ProductModel';
import {dbConnect} from '@/utils/dbConnect';
import { Op } from 'sequelize';
import { NextRequest } from 'next/server';

// تعریف نوع برای محصولات بازگشتی
interface ProductResult {
    imageUrl1?: string;
    title?: string;
    // سایر فیلدهایی که ممکن است برگردانده شوند
}

// تابع POST برای جستجوی محصولات
export async function POST(req: NextRequest): Promise<Response> {
    try {
        await dbConnect(); // اتصال به پایگاه داده
        
        // دریافت متن جستجو از درخواست
        const { text } = await req.json();
        
        // بررسی وجود متن جستجو
        if (!text || typeof text !== 'string') {
            return Response.json(
                { error: 'Text parameter is required and must be a string' },
                { status: 400 }
            );
        }

        // تبدیل متن به کلمات کلیدی
        const keywords = text.split(' ')
            .filter(keyword => keyword.trim().length > 0) // حذف کلمات خالی
            .map(keyword => ({
                title: {
                    [Op.iLike]: `%${keyword}%`
                }
            }));

        let allChild: ProductResult[] = [];

        // جستجوی محصولات بر اساس کلمات کلیدی
        if (keywords.length > 0) {
            allChild = await ProductsModel.findAll({
                where: {
                    [Op.or]: keywords
                },
                attributes: ['imageUrl', 'title']
            });
        }

        return Response.json(allChild); // بازگرداندن نتایج جستجو به صورت JSON

    } catch (error) {
        console.error('Search error:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}