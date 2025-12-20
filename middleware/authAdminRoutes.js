import UsersModel from '@/models/UsersModel';
import { decode } from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * میان‌افزار برای احراز هویت مسیرهای مدیریتی
 * 
 * @async
 * @function authAdminRoutes
 * @description تابع پیش‌فرض برای احراز هویت مسیرهای ادمین. توکن‌های کاربر را بررسی می‌کند،
 * دسترسی‌های مدیریتی را تأیید می‌نماید و با اطلاعات پایگاه داده اعتبارسنجی می‌کند.
 * 
 * @returns {Promise<Object>} یک پرامیس که در صورت موفقیت با اطلاعات کاربر برگشت داده می‌شود یا در صورت خطا شیء ریجکت برگشت داده می‌شود.
 * 
 * @throws {Object} شیء خطای احراز هویت شامل پیام و کد وضعیت:
 * @throws {Object} 401 - اگر توکن‌های کاربر وجود نداشته باشند (ورود نکرده است)
 * @throws {Object} 403 - اگر کاربر دسترسی مدیریتی نداشته باشد (ممنوع)
 */

// تابع پیش‌فرض برای احراز هویت مسیرهای ادمین
export default async function authAdminRoutes() {
    // دریافت کوکی‌ها
    const cookieStore = await cookies();
    return new Promise(async (resolve, reject) => {
        // دیکد کردن توکن‌های کاربر
        const user = decode(cookieStore.get('token')?.value, { complete: true });
        const httpUser = decode(cookieStore.get('httpToken')?.value, { complete: true });

        // بررسی وجود توکن‌ها
        if (!user || !httpUser) reject({ message: 'ابتدا وارد حساب خود شوید', status: 401 });
        // بررسی دسترسی ادمین
        if (!user.payload.isAdmin || !httpUser.payload.isAdmin) reject({ message: 'شما اجازه ی دسترسی ندارید', status: 403 });
        // یافتن کاربر در پایگاه داده
        const UserModel = await UsersModel.findByPk(httpUser.payload.userId,{raw: true});
        // بررسی دسترسی ادمین در پایگاه داده
        if (!UserModel?.isAdmin) reject({ message: 'شما اجازه ی دسترسی ندارید', status: 403 });
        // تایید دسترسی
        resolve(httpUser.payload);
    });
}
