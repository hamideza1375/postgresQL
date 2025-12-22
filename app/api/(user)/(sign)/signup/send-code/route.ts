import errorHandling from '@/middleware/errorHandling';
import sendCode from '@/middleware/sendCode';
import User from '@/models/UsersModel';
import { dbConnect } from '@/utils/dbConnect';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

interface RequestBody {
  email: string;
}

interface UserExistsResponse {
  message: string;
}

export async function POST(req: NextRequest) {
  return errorHandling(async (): Promise<NextResponse> => {
    await dbConnect();
    // throw new CustomError({message: 'send-code-filed', status: 400})
    const cookieStore = await cookies();

    // Check if user is already logged in
    // if (cookieStore.get('token') || cookieStore.get('httpToken')) {
    //   return NextResponse.json(
    //     { message: 'شما در حال حاضر یک حساب فعال دارید' },
    //     { status: 429 }
    //   );
    // }

    // Parse request body
    const { email }: RequestBody = await req.json();

    // Check if user exists
    const user = await User.findOne({ 
      where: {
        email: email
      },
      attributes: ['id'], // فقط دریافت id به جای تمام فیلدها
      raw: true // دریافت داده خام به جای نمونه مدل - معادل lean() در Mongoose
    });


    // if (user) {
    //   return NextResponse.json(
    //     { message: 'شما قبلاً ثبت‌نام کرده‌اید' },
    //     { status: 400 }
    //   );
    // }

    console.log('----------------------------------');
    console.log(email);
    console.log('----------------------------------');


    // Check resend time limit
    // if (cookieStore.get('ResendTime')) {
    //   return NextResponse.json(
    //     { message: 'تا اتمام سه دقیقه صبر کنید' },
    //     { status: 429 }
    //   );
    // }

    
    
    // Send verification code
    const response: UserExistsResponse = await sendCode(email, req.url);

    // Set resend time limit (3 minutes)
    const creationTime = Date.now();
    const expiresTime = creationTime + 60 * 1000 * 3;
    cookieStore.set('ResendTime', expiresTime.toString(), { 
      maxAge: 180,
      expires: new Date(expiresTime)
    });

    // Store email in cookie for next step
    cookieStore.set('email', email, { maxAge: 180 });

    return NextResponse.json(response, { status: 200 });
  });
}