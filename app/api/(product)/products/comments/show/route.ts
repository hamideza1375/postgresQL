import authAdminRoutes from '@/middleware/authAdminRoutes';
import errorHandling from '@/middleware/errorHandling';
import { Comment } from '@/models/ProductModel';
import { dbConnect } from '@/utils/dbConnect';
import getUser from '@/utils/getUser';
import { NextRequest } from 'next/server';

export async function PUT(req: NextRequest) {
    return errorHandling(async () => {
        await dbConnect();
        await authAdminRoutes();

        const id = req.nextUrl.searchParams.get('commentID');

        // بررسی وجود id
        if (!id) {
            return Response.json({ error: 'شناسه کامنت الزامی است' }, { status: 400 });
        }

        const _user = getUser(req);

        if (!_user.isAdmin) return Response.json('شما ادمین نیستید', { status: 403 });

        // به‌روزرسانی وضعیت نمایش کامنت
        const [updatedRowsCount] = await Comment.update(
            { show: true },
            {
                where: {
                    id: parseInt(id)
                }
            }
        );

        // بررسی اینکه آیا کامنتی به‌روزرسانی شده یا نه
        if (updatedRowsCount === 0) {
            return Response.json({ error: 'کامنت یافت نشد' }, { status: 404 });
        }

        // دریافت کامنت به‌روزرسانی شده
        const updatedComment = await Comment.findByPk(parseInt(id));

        return Response.json({
            message: 'کامنت به لیست افزوده شد',
            dt: updatedComment
        });
    })
}