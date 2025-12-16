import nodemailer from 'nodemailer';
import cache from '@/utils/node_cache.js';
import { cookies } from 'next/headers';

/**
 * ارسال کد تأیید به کاربر (ایمیل) با محدودیت نرخ و مدیریت خطاها
 *
 * @param {string} to - آدرس ایمیل دریافت‌کننده
 * @param {string} [path=''] - مسیر اختیاری برای محدودیت نرخ (rate limiting)
 * @returns {Promise<{ message: string; }>} - در صورت موفقیت:
 *   - `message`: پیام موفقیت
 * @throws {Object} - در صورت خطا یکی از موارد زیر را پرتاب می‌کند:
 *   - { message: string; status: 429 } (محدودیت نرخ)
 *   - { message: string } (خطای عمومی)
 */
function production_sendCode(to, path = '') {
    return new Promise((resolve, reject) => {
        // تولید یک کد تصادفی
        const random = Math.floor(Math.random() * 90000 + 1000);
        // بررسی اینکه آیا کد قبلاً برای این کاربر ارسال شده است یا خیر
        if (!cache.get('code' + to)) cache.set('code' + to, random);
        else
            return reject({
                message: 'بعد از اتمام سه دقیقه دوباره امتحان کنید, در صورت بروز مشکل صفحه را دوباره لود کنید',
                status: 429
            });

        // بررسی محدودیت نرخ ارسال کد
        if (cache.get('rateLimit' + path + to) >= 5)
            return reject({
                message: 'شما بیش از حد مجاز تلاش کردید, لطفا تا اتمام زمان ۵ دقیقه ای منتظر بمانید',
                status: 429
            });

        // تنظیم محدودیت نرخ ارسال کد
        cache.set('rateLimit' + path + to, (cache.get('rateLimit' + path + to) || 0) + 1, 60 * 5);

        // تنظیمات سرویس ایمیل
        const transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
                user: process.env.MY_EMAIL,
                pass: process.env.SECRET_PASSWORD
            }
        });
        // ارسال ایمیل
        transporter.sendMail(
            {
                from: process.env.MY_EMAIL,
                to,
                subject: 'ارسال کد از jslearn',
                text: `
jslearn.ir ارسال از
 Code: ${random}`
            },
            (err, info) => {
                if (err || !info) {
                    // در صورت بروز خطا، کد از حافظه کش حذف می‌شود
                    cache.del('code' + to);
                    reject('مشکلی پیش آمد اتصال اینترنت را برسی کنید');
                } else {
                    resolve({ message: 'کد دریافتی را وارد کنید' });
                }
            }
        );
    });
}

//////////////////

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Development) یا Production ارسال کد تأیید به کاربر (در حالت
 * @export
 * @param {string} [to=''] - آدرس ایمیل دریافت‌کننده
 * @param {string} [path=''] - مسیر برای محدودیت نرخ
 * @returns {Promise<{ message: string }>} - در صورت موفقیت:
 *   - Production: { message: 'کد دریافتی را وارد کنید' }
 *   - Development: { message: '12345 را به عنوان کد وارد کنید' }
 * @throws {Object} - در صورت خطا:
 *   - Production:
 *     - { message: string; status: 429 } (محدودیت نرخ)
 *     - { message: string } (خطای عمومی)
 *   - Development: خطایی پرتاب نمی‌شود
 */

export default function sendCode(to = '', path = '') {
    return new Promise(async (resolve, reject) => {
        if (isProduction) {
            await production_sendCode(to, path);
        } else {
            const cookieStore = await cookies();
            // cookieStore.delete('code' + to);

            if (!cookieStore.get('code' + to)) {
                cookieStore.set('code' + to, 12345, { maxAge: 180 });
                resolve({ message: '12345 را به عنوان کد وارد کنید' });
            } else {
                reject({
                    message:
                        'بعد از اتمام سه دقیقه دوباره امتحان کنید',
                    status: 429
                });
            }
        }
    });
}

/**
 * @param {string} to
 * @param {number | string} code
 * @returns {Promise<void>} - می‌شود resolve اگر کد صحیح باشد، پرامیس با موفقیت
 */
export const checkCode = (to, code) => {
    return new Promise(async (resolve, reject) => {
        if (isProduction) {
            if (cache.get('code' + to) != code) reject({ message: 'کد وارد شده اشتباه هست', status: 400 });
            else resolve();
        } else {
            const cookieStore = await cookies();
            if (cookieStore.get('code' + to)?.value != code)
                reject({ message: 'کد وارد شده اشتباه هست', status: 400 });
            else resolve();
        }
    });
};
