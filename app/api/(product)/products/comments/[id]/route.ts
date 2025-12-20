import authUserRoutes from '@/middleware/authUserRoutes';
import errorHandling from '@/middleware/errorHandling';
import { Comment, Product } from '@/models/ProductModel';
import {dbConnect} from '@/utils/dbConnect';
import getUser from '@/utils/getUser';
import { NextRequest } from 'next/server';



// ... existing code ...
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();

    // دریافت id از params با استفاده از await
    const { id } = await params;

    // بررسی وجود id
    if (!id) {
        return Response.json({ error: 'شناسه کامنت الزامی است' }, { status: 400 });
    }
    
    // دریافت کامنت بر اساس شناسه
    const comment = await Comment.findByPk(id, {
        attributes: ['message', 'rating']
    });

    const _comment = {
        message: comment?.message || '',
        star: comment?.rating || 0
    };

    return Response.json(_comment);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return errorHandling(async () => {
        await dbConnect();
        await authUserRoutes();

        // دریافت id از params با استفاده از await
        const { id } = await params;

        // بررسی وجود id
        if (!id) {
            return Response.json('شناسه کامنت الزامی است', { status: 400 });
        }

        const { message, star }: { message: string; star: number } = await req.json();

        // یافتن کامنت بر اساس شناسه
        const comment = await Comment.findByPk(id);
        
        if (!comment) {
            return Response.json('کامنت یافت نشد', { status: 404 });
        }

        // یافتن محصول مرتبط
        const product = await Product.findByPk(comment.productId);
        if (!product) {
            return Response.json('محصول یافت نشد', { status: 404 });
        }

        const _user = getUser(req);
        if (comment.userId !== _user.userId && !_user.isAdmin) {
            return Response.json('شما مجوز این کار را ندارید', { status: 403 });
        }

        // به‌روزرسانی کامنت
        await Comment.update(
            { 
                message: message, 
                rating: star, 
                show: false 
            },
            { 
                where: { 
                    id: id 
                } 
            }
        );

        // محاسبه مجدد میانگین امتیازات
        const comments = await Comment.findAndCountAll({
            where: {
                productId: product.id,
                isActive: true
            }
        });

        if (comments.count > 0) {
            const total = comments.rows.reduce(
                (total, comment) => total + comment.rating, 0
            );

            product.ratings = total;
            product.rating = total / comments.count;
        } else {
            product.rating = 0;
            product.ratings = 0;
        }

        await product.save();

        return Response.json({
            message: 'پیام شما ویرایش شد و بعد از تایید ادمین در سایت قرار میگیرد'
        });
    });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return errorHandling(async () => {
        await dbConnect();

        // دریافت id از params با استفاده از await
        const { id } = await params;

        // بررسی وجود id
        if (!id) {
            return Response.json('شناسه کامنت الزامی است', { status: 400 });
        }

        // یافتن کامنت بر اساس شناسه
        const comment = await Comment.findByPk(id);
        
        if (!comment) {
            return Response.json('کامنت یافت نشد', { status: 404 });
        }

        // یافتن محصول مرتبط
        const product = await Product.findByPk(comment.productId);
        if (!product) {
            return Response.json('محصول یافت نشد', { status: 404 });
        }

        const _user = getUser(req);
        if (comment.userId !== _user.userId && !_user.isAdmin) {
            return Response.json('شما مجوز این کار را ندارید', { status: 403 });
        }

        // حذف کامنت
        await Comment.destroy({
            where: {
                id: id
            }
        });

        // محاسبه مجدد میانگین امتیازات
        const comments = await Comment.findAndCountAll({
            where: {
                productId: product.id,
                isActive: true
            }
        });

        if (comments.count > 0) {
            const total = comments.rows.reduce(
                (total, comment) => total + comment.rating, 0
            );

            product.ratings = total;
            product.rating = comments.count > 0 ? total / comments.count : 0;
        } else {
            product.rating = 0;
            product.ratings = 0;
        }

        await product.save();

        return Response.json(product);
    });
}