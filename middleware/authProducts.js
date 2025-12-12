import { decode } from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * میان‌افزار احراز هویت برای کاربران در صفحه ی محصولات
 * @async
 * @description این میان‌افزار برای احراز هویت کاربران در بخش محصولات استفاده می‌شود.
 * توکن‌های کاربر را بررسی کرده و در صورت معتبر بودن، اطلاعات کاربر را به هدر اضافه می‌کند.
 * در صورت عدم تطابق شرایط، به سادگی از میان‌افزار عبور می‌کند.
 * 
 * @param {import("next/server").NextRequest} req - شیء درخواست
 * @param {import("next/server").NextResponse} res - شیء پاسخ
 * @param {import("next/server").NextResponse} next - تابع بعدی در زنجیره میان‌افزار
 * 
 * @returns {Promise<void>} Promise که پس از انجام عملیات resolve می‌شود
 */

export default async function authProducts(next) {
    return new Promise(async (resolve)=>{
        const cookieStore = await cookies();
        // دریافت توکن کاربر از کوکی‌ها
        const user = decode(cookieStore.get('token')?.value, { complete: true });
        const httpUser = decode(cookieStore.get('httpToken')?.value, { complete: true });
        // وجود نداشته باشد httpUser اگر توکن
        if (!httpUser) return resolve()
        // اگر توکن user وجود نداشته باشد
        if (!user) return resolve()
        // اگر user ادمین باشد و httpUser ادمین نباشد
        if (user.payload.isAdmin && !httpUser.payload.isAdmin) return resolve()
        // تنظیم هدر کاربر
        next.headers.set('user', JSON.stringify(httpUser.payload));
        resolve()
})
}
