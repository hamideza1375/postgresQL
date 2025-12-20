import rateLimit from '@/middleware/rateLimit';
import sendCode from '@/middleware/sendCode';
import User from '@/models/UsersModel';
import { dbConnect } from '@/utils/dbConnect';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse as res } from 'next/server';

interface RequestBody {
    email: string;
    password: string;
}

interface UserToken {
    userId?: number;
    username?: string;
    email: string;
    products?: any[];
}

interface AdminResponse {
    message: string;
}

export async function POST(req: NextRequest) {
    return rateLimit(req.url,async () => {
            await dbConnect();
        // دریافت داده‌های ارسالی از کلاینت
        const body: RequestBody = await req.json();
        const { email, password } = body;

        const usera = await User.findAll()

        console.log('usera', usera);
        


        // جستجوی کاربر در دیتابیس بر اساس ایمیل
        const user = await User.findOne({ 
            where: {
                email: email
            }
        });

        // اگر کاربر وجود نداشته باشد، خطا بازگردانده شود
        if (!user) {
            return res.json({ message: 'مشخصات اشتباه هست' }, { status: 400 });
        }

        // استفاده از middleware محدودیت نرخ درخواست (Rate Limit)
            // بررسی صحت رمز عبور
            await user.comparePassword(password);
            
            // اگر کاربر ادمین نباشد
            if (!user.isAdmin) {
                
                // ایجاد توکن برای کاربر عادی
                const forUserToken: UserToken = {
                    // ...(user.seller && { sellerId: user.seller.toString() }),
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    products: user.products
                };


                // ایجاد توکن اصلی برای کوکی
                const token = jwt.sign(forUserToken, 'token');
                const httpToken = jwt.sign(forUserToken, 'httpToken');
                

                // send response
                const response = res.json(
                    { message: {} }, 
                    { status: 200,
                        headers: {
                            // اضافه کردن توکن به هدر
                            // Authorization: `Bearer ${token}`,
                            Authorization: `${token}`,
                        }
                     }
                );
                
                // set cookies
                response.cookies.set('token', token, { 
                    maxAge: 60 * 60 * 24 * 30 
                });

                // set http cookies
                response.cookies.set('httpToken', httpToken, { 
                    maxAge: 60 * 60 * 24 * 30, 
                    httpOnly: true 
                });

                return response;
            }
            // اگر کاربر ادمین باشد
            else {
                // ارسال کد تأیید به ایمیل مدیر
                const response: AdminResponse = await sendCode(email, req.url);

                const cookieStore = await cookies()
                cookieStore.set('email', email);

                return res.json(response);
            }

    });
}