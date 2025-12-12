import { decode } from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * میان‌افزار سمت کلاینت برای احراز هویت ادمین اصلی
 * 
 * @async
 * @description این تابع برای احراز هویت ادمین‌های اصلی در سمت کلاینت استفاده می‌شود.
 * توکن‌های کاربر را بررسی می‌کند، سطح دسترسی را اعتبارسنجی می‌نماید.
 * 
 * @returns {Promise<{error: true} | {ok: true}>} شیء نتیجه که نشان‌دهنده موفقیت یا شکست احراز هویت است
 */

export default async function authMainAdminClient() {
    const cookieStore = await cookies();
    // دریافت توکن از کوکی‌ها و رمزگشایی آن‌ها
    const user = decode(cookieStore.get('token')?.value, { complete: true });
    const httpUser = decode(cookieStore.get('httpToken')?.value, { complete: true });
    // بررسی وجود توکن‌ها
    if (!user || !httpUser) return { error: true };
   
    // بررسی سطح دسترسی ادمین
    if (!httpUser.payload.isAdmin || httpUser.payload.isAdmin > 2) return { error: true };
    
    return { ok: true };
}
