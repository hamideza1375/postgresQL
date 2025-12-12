import authAdminRoutes from '@/middleware/authAdminRoutes';
import errorHandling from '@/middleware/errorHandling';
import { Comment, Product } from '@/models/ProductModel';
import User from '@/models/UsersModel';
import {dbConnect} from '@/utils/dbConnect';

export async function GET() {
    return errorHandling(async()=>{
        // اتصال به دیتابیس
        await dbConnect();
        
        // بررسی احراز هویت ادمین
        await authAdminRoutes();

        // دریافت نظراتی که نمایش داده نشده‌اند
        const comments = await Comment.findAll({
            where: {
                show: false,
                isActive: true
            },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'title']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['email']
                }
            ],
            attributes: ['id', 'message', 'rating', 'username', 'createdAt']
        });

        // بازگشت نظرات به صورت JSON
        return new Response(JSON.stringify(comments), {
            headers: { 'Content-Type': 'application/json' }
        });
    });
}