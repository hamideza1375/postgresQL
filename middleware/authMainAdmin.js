import { decode } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';


/**
 * میان‌افزار برای احراز هویت ادمین اصلی
 * 
 * @async
 * @description این میان‌افزار برای احراز هویت ادمین‌های اصلی با دسترسی سطح بالا استفاده می‌شود.
 * توکن‌های کاربر را بررسی می‌کند، سطح دسترسی را اعتبارسنجی می‌نماید.
 * 
 * @param {import("next/server").NextResponse} next - تابع بعدی در زنجیره میان‌افزار
 * @returns {Promise<import("next/server").NextResponse>} پاسخ JSON در صورت خطا یا فراخوانی next در صورت موفقیت
 * 
 * @throws {Object} 401 - اگر توکن‌های کاربر وجود نداشته باشند (نیاز به ورود)
 * @throws {Object} 403 - اگر کاربر دسترسی لازم را نداشته باشد (ممنوع)
 */

export default async function authMainAdmin(next) {
    const cookieStore = await cookies();
    // دریافت توکن کاربر از کوکی‌ها
    const user = decode(cookieStore.get('token')?.value, { complete: true });
    const httpUser = decode(cookieStore.get('httpToken')?.value, { complete: true });
    // بررسی وجود توکن‌ها
    if (!user || !httpUser) return NextRequest.json({ message: 'ابتدا وارد حسابتان شوید' }, { status: 401 });
    // بررسی سطح دسترسی ادمین
    if (!httpUser.payload.isAdmin || httpUser.payload.isAdmin > 2) return NextRequest.json({ message: 'شما اجازه ی دسترسی ندارید' }, { status: 403 });
    // تنظیم هدر کاربر
    next.headers.set('user', JSON.stringify(httpUser.payload));

    return next;
}
