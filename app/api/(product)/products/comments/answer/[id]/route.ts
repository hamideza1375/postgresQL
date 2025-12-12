import {dbConnect} from '@/utils/dbConnect';
import errorHandling from '@/middleware/errorHandling';
import { Answer } from '@/models/ProductModel';
import { NextRequest } from 'next/server';
import getUser from '@/utils/getUser';

export async function POST(req:NextRequest, { params }:{params:{id:string}}) {
    return errorHandling(async()=>{
        await dbConnect();
        
        // بررسی وجود id
        if (!params.id) {
            return Response.json({ error: 'شناسه کامنت الزامی است' }, { status: 400 });
        }
        
        const { message } = await req.json();

        const _user = getUser(req);

        if(!_user.isAdmin) return Response.json('شما مجوز این کار را ندارید', {status:429});

        // ایجاد پاسخ جدید
        const answer = await Answer.create({
            username: _user.username,
            message: message,
            to: '', // مقدار پیش‌فرض
            commentId: parseInt(params.id),
            isActive: true
        });

        return Response.json({ 
            message: 'ساخته شد', 
            dt: answer 
        });
    })
}

export async function GET(req:NextRequest, { params }:{params:{id:string}}) {
    await dbConnect();
    
    // بررسی وجود id
    if (!params.id) {
        return Response.json({});
    }

    // دریافت پاسخ بر اساس شناسه
    const answer = await Answer.findByPk(parseInt(params.id));

    return Response.json(answer || {});
}


export async function PUT(req:NextRequest, { params }:{params:{id:string}}) {
    return errorHandling(async()=>{
        await dbConnect();
        
        // بررسی وجود id
        if (!params.id) {
            return Response.json({ error: 'شناسه پاسخ الزامی است' }, { status: 400 });
        }

        const { message } = await req.json();

        const _user = getUser(req);

        if(!_user.isAdmin) return Response.json('شما مجوز این کار را ندارید', {status:429})

        // به‌روزرسانی پیام پاسخ
        const [updatedRowsCount] = await Answer.update(
            { message: message },
            { 
                where: { 
                    id: parseInt(params.id) 
                } 
            }
        );

        // بررسی اینکه آیا پاسخی به‌روزرسانی شده یا نه
        if (updatedRowsCount === 0) {
            return Response.json({ error: 'پاسخ یافت نشد' }, { status: 404 });
        }

        // دریافت پاسخ به‌روزرسانی شده
        const updatedAnswer = await Answer.findByPk(parseInt(params.id));

        return Response.json({ 
            message: 'به‌روزرسانی شد', 
            dt: updatedAnswer 
        });
    })
}


export async function DELETE(req:NextRequest, { params }:{params:{id:string}}) {
    return errorHandling(async()=>{
        await dbConnect();
        
        // بررسی وجود id
        if (!params.id) {
            return Response.json({ error: 'شناسه پاسخ الزامی است' }, { status: 400 });
        }

        const _user = getUser(req);

        if(!_user.isAdmin) return Response.json('شما مجوز این کار را ندارید', {status:429})

        // حذف پاسخ بر اساس شناسه
        const deletedRowsCount = await Answer.destroy({
            where: {
                id: parseInt(params.id)
            }
        });

        // بررسی اینکه آیا پاسخی حذف شده یا نه
        if (deletedRowsCount === 0) {
            return Response.json({ error: 'پاسخ یافت نشد' }, { status: 404 });
        }

        return Response.json({ message: 'حذف شد' });
    })
}