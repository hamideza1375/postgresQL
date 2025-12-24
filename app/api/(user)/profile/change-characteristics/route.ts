import errorHandling from '@/middleware/errorHandling';
import rateLimit from '@/middleware/rateLimit';
import sendCode, { checkCode } from '@/middleware/sendCode';
import UsersModel from '@/models/UsersModel';
import { dbConnect } from '@/utils/dbConnect';
import getUser from '@/utils/getUser';
import cache from '@/utils/node_cache';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';


interface RequestBodyPOST {
    password: string;
}

interface RequestBodyPUT {
    code: string;
    username: string;
    newPassword: string;
}

interface UserToken {
    userId?: string;
    username?: string;
    email: string;
    products?: any[];
}


/**
 * در این ای‌پی‌آی کاربر می تواند از طریق ایمیل خود و گذرواژه جدید، مشخصات خود را تغییر دهد
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    return rateLimit(req.url, async (): Promise<NextResponse> => {
        await dbConnect();
        // اگر زمان ارسال مجدد کد به پایان رسیده باشد، اجازه ارسال مجدد را می دهیم
        const cookieStore = await cookies();
        // if (cookieStore.get('ResendTime')) {
        //     return NextResponse.json('تا اتمام سه دقیقه صبر کنید', { status: 429 });
        // }

        // اطلاعات کاربر
        const _user = getUser(req)

        // دریافت اطلاعات جدید کاربر از ریکوئست
        const body: RequestBodyPOST = await req.json();

        // بررسی ایمیل کاربر
        const user = await UsersModel.findOne({
            where: {
                email: _user.email
            }
        });

        if (!user) {
            return NextResponse.json('کاربر یافت نشد', { status: 404 });
        }

        // بررسی گذرواژه قبلی کاربر
        await user.comparePassword(body.password);

        // ارسال کد
        const response = await sendCode(_user.email, req.url);

        // تعیین زمان ارسال مجدد کد
        const creationTime = Date.now();
        const expiresTime = creationTime + 60 * 1000 * 3;
        cookieStore.set('ResendTime', expiresTime.toString(), { maxAge: 180 });

        // ارسال پاسخ
        return NextResponse.json(response);
    });
}


export async function PUT(req: NextRequest): Promise<NextResponse> {
    return errorHandling(async (): Promise<NextResponse> => {
        await dbConnect();
        // گرفتن کوکی ها
        const cookieStore = await cookies();

        // دریافت اطلاعات کاربر
        const _user = getUser(req);
        const { code, username, newPassword }: RequestBodyPUT = await req.json();

        console.log(code, username, newPassword);
        


        await checkCode(_user.email, code);


        // const [updatedRowsCount] = await UsersModel.update(
        //     {
        //         username,
        //         password: newPassword
        //     },
        //     {
        //         where: {
        //             email: _user.email
        //         }
        //     }
        // );

        // // بررسی اینکه آیا رکوردی به‌روزرسانی شده است یا خیر
        // if (updatedRowsCount === 0) {
        //     return NextResponse.json(
        //         { error: 'کاربر مورد نظر یافت نشد' },
        //         { status: 404 }
        //     );
        // }


        // دریافت اطلاعات کاربر
        const user = await UsersModel.findOne({
            where: {
                email: _user.email
            }
        });

        if (!user) {
            return NextResponse.json('کاربر یافت نشد', { status: 404 });
        }

        // بروزرسانی اطلاعات کاربر
        await user.update({
            username,
            password: newPassword
        });

        const forUserToken: UserToken = {
            userId: user.id,
            username: user.username,
            email: user.email,
            products: user.products
        };

        // ایجاد توکن اصلی برای کوکی
        const token = sign(forUserToken, 'token');
        const httpToken = sign(forUserToken, 'httpToken');

        // set cookies
        cookieStore.set('token', token, {
            maxAge: 60 * 60 * 24 * 30
        });

        // set http cookies
        cookieStore.set('httpToken', httpToken, {
            maxAge: 60 * 60 * 24 * 30,
            httpOnly: true
        });

        // حذف کوکی ارسال مجدد کد
        cookieStore.delete('ResendTime');

        // حذف کد از کد
        cache.del('code' + user.email);

        // await checkCode(_user.email, code);


        // ارسال پاسخ
        return NextResponse.json({ value: token, message: {} }, { status: 201 });
    });
}