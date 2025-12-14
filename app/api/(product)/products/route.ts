// وارد کردن مدل محصولات و تابع اتصال به دیتابیس
import ProductsModel from '@/models/ProductModel';
import {dbConnect} from '@/utils/dbConnect';
import { NextRequest } from 'next/server';

// تابع GET برای دریافت محصولات
export async function GET(request: NextRequest) {
    try {
        // اتصال به دیتابیس
        await dbConnect();
        let products;
        const categoryId = request.nextUrl.searchParams.get('categoryId');
        
        // بررسی وجود پارامتر categoryId در درخواست
        if (categoryId) {
            // جستجوی محصولات بر اساس categoryId و انتخاب فیلدهای مشخص
            products = await ProductsModel.findAll({ 
                where: {
                    categoryId: categoryId
                },
                attributes: {
                    exclude: [
                        'comments',
                        'stars',
                        'videoUrl',
                        'progress'
                    ]
                }
            });
        } else {
            // جستجوی همه محصولات و مرتب‌سازی بر اساس تاریخ
            products = await ProductsModel.findAll({
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: [
                        'comments',
                        'parts',
                        'questions',
                        'stars',
                        'videoUrl',
                        'progress'
                    ]
                }
            });
        }
        
        // بازگشت پاسخ به صورت JSON
        return Response.json(products);
    } catch (err) {
        // ثبت خطا در کنسول
        console.log(err);
        // بازگشت پاسخ خطا به صورت JSON
        return Response.json({}, { status: 500 });
    }
}