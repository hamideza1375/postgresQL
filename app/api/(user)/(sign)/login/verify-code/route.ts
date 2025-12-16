import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse as res, type NextRequest } from 'next/server';

import errorHandling from '@/middleware/errorHandling';
import { checkCode } from '@/middleware/sendCode';
import { dbConnect } from '@/utils/dbConnect';

// Define interfaces for better type safety
type RequestBody = {
  code: string;
}

interface TokenPayload {
  isAdmin: boolean;
  userId: string;
  username: string;
  email: string;
  products: any[];
}



export async function POST(req: NextRequest) {
  return errorHandling(async () => {
    await dbConnect();
    const cookieStore = await cookies();

    // دریافت داده‌های ارسالی از کلاینت
    const { code }: RequestBody = await req.json();

  //   if (cookieStore.get('token') || cookieStore.get('httpToken')) {
  //     return Response.json({ message: 'شما در حال حاضر یک حساب فعال دارید' }, { status: 429 });
  // }

    // دریافت ایمیل از کوکی
    const email = cookieStore.get('email')?.value;

    // اگر ایمیل وجود نداشته باشد، خطا بازگردانده شود
    if (!email) {
      return res.json(
        { message: 'لطفاً ابتدا کد تأیید را دریافت کنید' }, 
        { status: 400 }
      );
    }

    // بررسی صحت کد تأیید
    // const cachedCode = cache.get('code' + email);
    await checkCode(email, code);


    // ایجاد توکن برای مدیر
    const forToken: TokenPayload = {
      isAdmin: true,
      userId: email,
      username: email,
      email: email,
      products: []
    };

    const token = jwt.sign(forToken, 'token');
    const httpToken = jwt.sign(forToken, 'httpToken');

    // Create response
    const response = res.json(
      { message: {} },
      { status: 200, headers: {
        // اضافه کردن توکن به هدر
        Authorization: `Bearer ${token}`,
    } }
    );

    // Set cookies on the response
    response.cookies.set('token', token, { 
      maxAge: 60 * 60 * 24 * 30 
    });
    response.cookies.set('httpToken', httpToken, { 
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true 
    });

    cookieStore.delete('email')

    return response;
  });
}