import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { _userAgent } from './middleware/_userAgent';
import authMainAdmin from './middleware/authMainAdmin';
import authMainAdminClient from './middleware/authMainAdminClient';
import authProducts from './middleware/authProducts';
import authSignClient from './middleware/authSignClient';
import authUser from './middleware/authUser';
import authUserClient from './middleware/authUserClient';
import block from './middleware/block';
import { preventInvalidPhotos } from './middleware/preventInvalidPhotos';
import { forbidden } from 'next/navigation';

interface AuthError {
   error: boolean;
   ok: boolean;
}

export async function middleware(req: NextRequest) {
   try {
      const response = NextResponse.next();

      await block(req);

      // بررسی userAgent
      if (_userAgent(req)) return isBotMessage();

      // بررسی حجم تصویر
      if ((await preventInvalidPhotos(req)) === 'MAX_LENGTH') {
         return NextResponse.json('حجم تصویر نباید بزرگ تر از ۲ مگابایت باشد', { status: 413 });
      }

      // بررسی مسیرهای مختلف و اعمال احراز هویت
      if (req.nextUrl.pathname.startsWith('/api/dashboard')) {
         await authMainAdmin(response);
         return response;
      } else if (
         req.nextUrl.pathname.startsWith('/api/profile')) {
         await authUser(response);
         return response;
      } else if (req.nextUrl.pathname.startsWith('/api/products')) {
         await authProducts(response);
         return response;
      }

      // client
      else if (req.nextUrl.pathname.startsWith('/dashboard')) {
         const { error } = (await authMainAdminClient()) as AuthError;
         if (error) return forbidden();
         return response;
      }  else if (req.nextUrl.pathname.startsWith('/profile')) {
         const { error } = (await authUserClient()) as AuthError;
         if (error) return NextResponse.redirect(new URL('/login', req.url));
         return response;
      } else if (req.nextUrl.pathname.startsWith('/login')) {
         const { error } = (await authSignClient()) as AuthError;
         if (error) return NextResponse.redirect(new URL('/profile', req.url));
         return response;
      }
   } catch (error: unknown) {
      const err = error as Error & { status?: number };
      return new Response(err?.message || 'خطای سرور', {
         status: err?.status || 500
      });
   }
}

function isBotMessage() {
   return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"><title>boot</title></head><body dir="rtl" style="height:100vh;width:100vw;background-color:#0a0010; overflow:hidden; display:flex; flex-direction:column; align-items: center " ><h2 style="text-align:center; margin-inline:auto;color:#a22; margin-top:30px" >اگر فیلتر شکن شما روشن هست آن را خاموش کنید</h2></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
   );
}
