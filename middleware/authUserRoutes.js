import UsersModel from '@/models/UsersModel';
import { decode } from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * میان‌افزار اصلی برای احراز هویت کاربران در مسیرهای سرور
 * 
 * @async
 * @description این تابع برای احراز هویت کاربران در مسیرهای سرور استفاده می‌شود.
 * توکن‌های کاربر را بررسی کرده، وضعیت حساب کاربر را در دیتابیس اعتبارسنجی می‌نماید
 * و در صورت موفقیت، اطلاعات کاربر را بازمی‌گرداند.
 * 
 * @returns {Promise<Object>} Promise که در صورت موفقیت با payload کاربر resolve می‌شود
 * 
 * @throws {Object} خطاهای احراز هویت:
 * @throws {Object} 401 - اگر توکن‌ها معتبر نباشند یا حساب کاربر مسدود شده باشد
 * 
 * @example
 * // استفاده در API routes
 * try {
 *   const userData = await authUserRoutes();
 *   // ادامه عملیات با اطلاعات کاربر
 * } catch (error) {
 *   return NextResponse.json(
 *     { message: error.message },
 *     { status: error.status }
 *   );
 * }
 */

// تابع اصلی برای احراز هویت کاربر
export default async function authUserRoutes() {
    // دریافت کوکی‌ها
    const cookieStore = await cookies();
    return new Promise(async (resolve, reject) => {
        // دیکد کردن توکن‌ها از کوکی‌ها
        const user = decode(cookieStore.get('token')?.value, { complete: true });
        const httpToken = decode(cookieStore.get('httpToken')?.value, { complete: true });
        
        // بررسی وجود توکن‌ها
        if (!user?.payload || !httpToken?.payload)
            return reject({ message: 'ابتدا وارد حساب خود شوید', status: 401 });
        
        console.log('-----------------------');

        console.log('user',user);
        console.log('-----------------------');

        console.log('httpToken',httpToken);

        // پیدا کردن کاربر با استفاده از آی‌دی
        const UserModel = await UsersModel.findByPk(Number(httpToken.payload.userId));
        
        // بررسی نوع داده و وضعیت حساب کاربر
        if (typeof UserModel !== 'object') reject({ message: 'ابتدا وارد حساب خود شوید', status: 401 });
        if ((UserModel?.blocked)) reject({ message: 'حساب شما مسدود شده لطفا از طریق تیکت پیگیری کنید', status: 401 });
        
        // بازگرداندن اطلاعات توکن
        resolve(httpToken.payload);
    });
}
