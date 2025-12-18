import {dbConnect} from '@/utils/dbConnect';
import fs from 'fs';
import util from 'util';

/**
 * بررسی وجود حروف فارسی در متن
 * @param {string} input - متن ورودی
 * @returns {boolean} true اگر حروف فارسی وجود داشته باشد
 */
// تابع برای بررسی وجود حروف فارسی در متن
function hasPersianLetters(input) {
    const persianPattern = /[\u0600-\u06FF\\]/;
    return persianPattern.test(input);
}

/**
 * استخراج اطلاعات فایل و خط از stack trace
 * @param {string} stack - stack trace خطا
 * @returns {Object} شیء حاوی اطلاعات فایل و خط
 */
// تابع برای استخراج اطلاعات فایل و خط از stack trace
function getFileAndLineFromStack(stack) {
    const stackLines = stack?.split('\n');
    if (stackLines.length > 1) {
        const match = stackLines[1].match(/\((.+):(\d+):(\d+)\)/);
        if (match) {
            return {
                file: match[1],
                line: match[2],
            };
        }
    }
    return { file: 'unknown', line: 'unknown' };
}

/**
 * سیستم جامع مدیریت و پردازش خطاهای سرور
 * 
 * @async
 * @function errorHandling
 * @description این تابع یک wrapper برای مدیریت خطاها در برنامه‌های Node.js است.
 * خطاها را ثبت می‌کند، اطلاعات دقیق اشکال‌زدایی را استخراج می‌نماید و پاسخ مناسب به کاربر ارسال می‌کند.
 * 
 * @param {Function} call - تابعی که باید اجرا شود و خطاهای آن مدیریت شود
 * @returns {Promise<import("next/server").NextResponse>} پاسخ مناسب به کاربر بر اساس نوع خطا
 * 
 * @property {Function} hasPersianLetters - بررسی وجود حروف فارسی در متن
 * @property {Function} getFileAndLineFromStack - استخراج اطلاعات فایل و خط از stack trace
 * 
 * @example
 * // استفاده در API routes
 * export async function POST(request) {
 *   return errorHandling(async () => {
 *     // منطق سرویس
 *     return Response.json({ data: 'عملیات موفق' });
 *   });
 * }
 */
// تابع اصلی برای مدیریت خطاها
export default async function errorHandling(call) {
    try {
        await dbConnect()
        return await call();
    } catch (error) {
        // stack trace استخراج اطلاعات فایل و خط از
        const { file, line } = getFileAndLineFromStack(error.stack || '');

        // برای نمایش رنگی در کنسول util.inspect فرمت‌بندی خطا با استفاده از
        const errorMessage = (error) => util.inspect(error, {
            colors: true,
            depth: null,
        });

        // ایجاد پیام خطا
        const logMessage = JSON.stringify({
            message: `Error: ${error.message}`,
            file,
            line,
            date: new Date().toLocaleDateString('fa'),
        }) + '\n';

        // لاگ کردن خطا در فایل
        fs.appendFile('error.log', logMessage, (err) => {
            if (err) {
                console.error('Failed to write to log file:', err);
            }
        });

        // نمایش خطا در کنسول به صورت رنگی
        console.error(errorMessage(error.message));

        // بررسی وجود حروف فارسی در پیام خطا و ارسال پاسخ مناسب
        if (hasPersianLetters(error?.message)) {
            const errorFa = error.message.match(/[\u0600-\u06FF]+/g)?.join(' ') || 'خطای نامشخص';
            return Response.json(errorFa, { status: error.status || 400 });
        } else {
            return Response.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }
}