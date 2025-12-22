import { decode } from 'jsonwebtoken';
import { cookies } from 'next/headers';


/**
 * میان‌افزار احراز هویت کاربران
 * 
 * @async
 * @function authUser
 * @description این میان‌افزار برای احراز هویت کاربران عادی و مدیریت دسترسی‌ها استفاده می‌شود.
 * توکن‌های کاربر را بررسی کرده و اعتبارسنجی می‌نماید، سپس در صورت معتبر بودن، اطلاعات کاربر را به هدر اضافه می‌کند.
 * 
 * @param {import("next/server").NextResponse} next - تابع بعدی در زنجیره میان‌افزار
 * @returns {Promise<void>} Promise که پس از انجام عملیات resolve می‌شود یا در صورت خطا reject می‌شود
 * 
 * @throws {Object} خطاهای احراز هویت:
 * @throws {Object} 401 - اگر توکن‌ها وجود نداشته باشند (نیاز به ورود)
 * @throws {Object} 403 - اگر کاربر دسترسی لازم را نداشته باشد (ممنوع)
 */

export default async function authUser(next) {
    return new Promise(async (resolve, reject)=>{
        const cookieStore = await cookies();
        // دریافت توکن کاربر از کوکی‌ها
        const user = decode(cookieStore.get('token')?.value, { complete: true });
        const httpUser = decode(cookieStore.get('httpToken')?.value, { complete: true });
        
        // بررسی اینکه آیا توکن httpUser وجود دارد یا خیر
        if (!httpUser) return reject({ message: 'ابتدا وارد حسابتان شوید' , status: 401 });
        
        // بررسی اینکه آیا توکن user وجود دارد یا خیر
        if (!user) return reject({ message: 'ابتدا وارد حسابتان شوید' , status: 401 });
        
        // اگر user ادمین باشد و httpUser ادمین نباشد
        if (user.payload.isAdmin && !httpUser.payload.isAdmin) return reject({ message: 'شما دسترسی مجاز را ندارید' , status: 403 });

        // تنظیم هدر user با اطلاعات توکن httpUser
        next.headers.set('user', JSON.stringify(httpUser.payload));
        resolve()
    })
}
