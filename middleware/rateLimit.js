import { cookies } from 'next/headers';
import errorHandling from './errorHandling';
import { NextResponse } from 'next/server';


/**
 * میان‌افزار محدودکننده نرخ درخواست (Rate Limiter)
 * 
 * @async
 * @function rateLimit
 * @description این تابع برای جلوگیری از حملات brute-force و سوء استفاده از API استفاده می‌شود.
 * با ردیابی تعداد درخواست‌های کاربر از طریق کوکی‌ها، از ارسال درخواست‌های بیش از حد مجاز جلوگیری می‌کند.
 * 
 * @param {Function} call - تابعی که باید پس از اعمال محدودیت اجرا شود
 * @param {string} [path=''] - مسیری که روش محدودیت اعمال میشود
 * @returns {Promise<NextResponse>} پاسخ تابع call یا پیام خطای محدودیت نرخ
 * 
 * @property {number} MAX_ATTEMPTS - حداکثر تعداد تلاش‌های مجاز (5 بار)
 * @property {number} RETRY_LIMIT - حداکثر تعداد دفعات تکرار مجاز (3 بار)
 * 
 * @example
 * // استفاده در API routes
 * export async function POST(request) {
 *   return rateLimit(async () => {
 *     // منطق سرویس
 *     return Response.json({ data: 'عملیات موفق' });
 *   });
 * }
 */

 async function rateLimit(path='',call) {
    return errorHandling(async()=>{
        // دریافت کوکی‌ها
        const cookieStore = await cookies();
        // دریافت تعداد تلاش‌ها و مقدار retry از کوکی‌ها
        let attempts = Number(cookieStore.get('attempts')?.value) || 0;
        let retry = Number(cookieStore.get('retry')?.value) || 0;

        // بررسی تعداد تلاش‌ها
        if (attempts >= 5) {
            // تنظیم کوکی retry برای ۱ ساعت
            cookieStore.set('retry' + path, 1, { maxAge: 60 * 60, httpOnly: true });
            return Response.json(
                {
                    message: `شما بیش از حد مجاز تلاش کرده‌اید. لطفاً تا اتمام زمان ۵ دقیقه ای منتظر بمانید `
                },
                { status: 429 }
            );
        } else if (retry == 3) {
            return Response.json(
                {
                    message: `شما بیش از حد مجاز تلاش کرده‌اید. لطفاً تا اتمام زمان ۱ ساعته منتظر بمانید `
                },
                { status: 429 }
            );
        }

        // افزایش مقدار retry در صورت وجود
        if(retry) cookieStore.set('retry' + path, retry + 1, { maxAge: 60 * 60, httpOnly: true });

        // افزایش تعداد تلاش‌ها
        cookieStore.set('attempts' + path, attempts + 1, { maxAge: 5 * 60, httpOnly: true });
        return await call();
    })
}




async function d_rateLimit(path='',call) {
    return errorHandling(async()=>{
        return await call();
    })
}

const isProduction = process.env.NODE_ENV === 'production';

export default (isProduction?  rateLimit:  d_rateLimit)
