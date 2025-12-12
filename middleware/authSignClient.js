import { cookies } from 'next/headers';


/**
 * میان‌افزار سمت کلاینت برای بررسی وضعیت احراز هویت کاربر
 *
 * @async
 * @function authSignClient
 * @description این تابع وضعیت ورود/خروج کاربر را در سمت کلاینت بررسی می‌کند.
 * با بررسی وجود توکن در کوکی‌ها، وضعیت احراز هویت کاربر را مشخص می‌نماید.
 *
 * @returns {Promise<{error: boolean} | {ok: boolean}>} نتیجه بررسی وضعیت احراز هویت
 */

export default async function authSignClient() {
   const cookieStore = await cookies();

   if (cookieStore.get('token')) return { error: true };
   if (cookieStore.get('httpToken')) return { error: true };
   else return { ok: true };
}
