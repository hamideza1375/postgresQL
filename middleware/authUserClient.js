import { cookies } from 'next/headers';

/**
 * میان‌افزار سمت کلاینت برای بررسی وضعیت احراز هویت کاربر
 *
 * @async
 * @function authUserClient
 * @description این تابع وضعیت ورود/خروج کاربر را در سمت کلاینت با بررسی وجود توکن بررسی می‌کند.
 * مناسب برای استفاده در کامپوننت‌های React و شرایطی که نیاز به بررسی سریع وضعیت احراز هویت داریم.
 *
 * @returns {Promise<{ok: boolean} | {error: boolean}>} نتیجه بررسی وضعیت احراز هویت
 *
 */
export default async function authUserClient() {
   const cookieStore = await cookies();

   if (cookieStore.get('token')?.value) return { ok: true };
   if (cookieStore.get('httpToken')?.value) return { ok: true };
   else return { error: true };
}
