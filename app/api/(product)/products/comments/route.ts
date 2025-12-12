import authUserRoutes from '@/middleware/authUserRoutes';
import errorHandling from '@/middleware/errorHandling';
import ProductsModel from '@/models/ProductModel';
import { Comment } from '@/models/ProductModel';
import {dbConnect} from '@/utils/dbConnect';
import getUser from '@/utils/getUser';
import { NextRequest } from 'next/server';


export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const productId = Number(searchParams.get('productId'));
        
        // دریافت کامنت‌های مربوط به محصول
        const comments = await Comment.findAll({
            where: {
                productId: productId
            },
            order: [['createdAt', 'DESC']],
            limit: 100
        });

        return Response.json(comments);
    } catch (error) {
        console.log(error);
        return Response.json([]);
    }
}

export async function POST(request: NextRequest) {
    return errorHandling(async () => {
        await dbConnect();
        await authUserRoutes();

        const searchParams = request.nextUrl.searchParams;
        const _user = getUser(request);
        const productId = Number(searchParams.get('productId'));

        const { message, rating } = await request.json();

        // یافتن محصول
        const product = await ProductsModel.findByPk(productId);
        
        if (!product) {
            return Response.json({ error: 'محصول یافت نشد' }, { status: 404 });
        }

        // ایجاد کامنت جدید
        await Comment.create({
            message,
            rating: Number(rating),
            username: _user.username,
            userId: _user.userId,
            productId: productId,
            show: false, // بصورت پیشفرض نمایش داده نشود تا پس از تایید مدیر نمایش یابد
            likeCount: 0
        });

        // به روز رسانی امتیازات محصول
        const comments = await Comment.findAndCountAll({
            where: {
                productId: productId
            }
        });
        
        const totalRatings = comments.rows.reduce((sum, comment) => sum + comment.rating, 0);
        product.ratings = totalRatings;
        product.rating = comments.count > 0 ? totalRatings / comments.count : 0;
        
        await product.save();

        return Response.json({
            message: 'کامنت شما ارسال شد و بعد از تایید مدیر در سایت قرار میگیرد'
        });
    });
}