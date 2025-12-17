import errorHandling from '@/middleware/errorHandling';
import rateLimit from '@/middleware/rateLimit';
import sendCode, { checkCode } from '@/middleware/sendCode';
import User from '@/models/UsersModel';
import { dbConnect } from '@/utils/dbConnect';
import cache from '@/utils/node_cache.js';
import { ChangePasswordValidator } from '@/validator/AuthValidator';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

interface PostRequestBody {
  email: string;
  password: string;
}


interface SendCodeResponse {
    message: string;
}

interface PutRequestBody {
  code: number;
}

// type NumericString = `${number}`


export async function POST(req: NextRequest): Promise<NextResponse> {
  return rateLimit(req.url,async () => {
    await dbConnect();
    const cookieStore = await cookies();
    
    // Check if resend time is still active
    if (cookieStore.get('ResendTime')) {
      return Response.json(
        { message: 'تا اتمام سه دقیقه صبر کنید' }, 
        { status: 429 }
      );
    }

    const { email, password }: PostRequestBody = await req.json();
    await ChangePasswordValidator.validate({ email, password })
    const user = await User.findOne({ 
      where: {
        email: email
      },
      attributes: ['id'],
      raw: true
    });

    if (!user) {
      return Response.json(
        { message: 'ایمیل وارد شده اشتباه هست' }, 
        { status: 400 }
      );
    }

    // Store email and new password in cookies
    cookieStore.set('email', email, { maxAge: 180 });
    cookieStore.set('password', password, { maxAge: 180 });

    const response: SendCodeResponse = await sendCode(email, req.url);

    const creationTime = Date.now();
    const expiresTime = creationTime + 60 * 1000 * 3;
    cookieStore.set('ResendTime', expiresTime.toString(), { 
      maxAge: 180,
      expires: new Date(expiresTime)
    });

    return Response.json(response);
  });
}

/**
 * Allows user to reset password using received code and new password
 * @param req NextRequest
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  return errorHandling(async () => {
    await dbConnect();
    const cookieStore = await cookies();

    const { code }: PutRequestBody = await req.json();
    const email = cookieStore.get('email')?.value;

    console.log(cookieStore.get('email'));
    

    if (!email) {
      return Response.json(
        { message: 'لطفاً ابتدا درخواست تغییر رمز را ارسال کنید' },
        { status: 400 }
      );
    }

    // Verify the code
    await checkCode(email,code);

    const user = await User.findOne({ 
      where: {
        email: email
      }
    });
    
    if (!user) {
      return Response.json(
        { message: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    const newPassword = cookieStore.get('password')?.value;
    if (!newPassword) {
      return Response.json(
        { message: 'لطفاً رمز جدید را ارسال کنید' },
        { status: 400 }
      );
    }

    user.setDataValue('password', newPassword);
    await user.save();

    // Clean up cookies
    cookieStore.delete('email');
    cookieStore.delete('password');
    cookieStore.delete('ResendTime');
    cache.del('code' + email);

    return Response.json(
      { message: 'رمز شما با موفقیت تغییر کرد' },
      { status: 200 }
    );
  });
}