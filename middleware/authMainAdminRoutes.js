import { UsersModel } from '@/models/UsersModel';
import { decode } from 'jsonwebtoken';
import { cookies } from 'next/headers';


/**
 * میان‌افزار برای احراز هویت مسیرهای ادمین اصلی
 * 
 * @async
 * @description این تابع برای احراز هویت ادمین‌های اصلی در مسیرهای سرور استفاده می‌شود.
 * توکن‌های کاربر را بررسی می‌کند، سطح دسترسی را در توکن و دیتابیس اعتبارسنجی می‌نماید.
 * 
 * @returns {Promise<Object>} یک Promise که در صورت موفقیت با payload کاربر resolve می‌شود
 * یا در صورت خطا با شیء خطا reject می‌شود.
 * 
 * @throws {Object} خطاهای احراز هویت:
 * @throws {Object} 401 - اگر توکن‌ها وجود نداشته باشند (نیاز به ورود)
 * @throws {Object} 403 - اگر کاربر دسترسی ادمین اصلی نداشته باشد
 * @throws {Object} 403 - اگر حالت تاریک فعال نباشد
 * 
 */


export default async function authMainAdminRoutes() {
    const cookieStore = await cookies();
    return new Promise(async (resolve, reject) => {
        // دیکد کردن توکن های کاربر از کوکی ها
        const user = decode(cookieStore.get('token')?.value, { complete: true });
        const httpUser = decode(cookieStore.get('httpToken')?.value, { complete: true });

        // بررسی اینکه آیا توکن ها معتبر هستند یا خیر
        if (!user || !httpUser) reject({ message: 'ابتدا وارد حساب خود شوید', status: 401 });
        // بررسی اینکه آیا کاربر ادمین است یا خیر
        if (!user.payload.isAdmin || !httpUser.payload.isAdmin) reject({ message: 'شما اجازه ی دسترسی ندارید', status: 403 });
        const UserModel = await UsersModel.findByPk(httpUser.payload.userId);
        // بررسی اینکه آیا کاربر ادمین معتبر است یا خیر
        if (!UserModel?.isAdmin || UserModel?.isAdmin > 2) reject({ message: 'شما اجازه ی دسترسی ندارید', status: 403 });
      
        resolve(httpUser.payload);
    });
}
