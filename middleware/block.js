import nodeCache from "node-cache"
const cache = new nodeCache()

/**
 * میان‌افزار محدودکننده درخواست‌های متوالی
 * 
 * @async
 * @description این تابع برای جلوگیری از حملات brute-force و سوء استفاده از APIها استفاده می‌شود.
 * با ردیابی آی‌پی کاربر و شمارش درخواست‌های ناموفق، از ارسال درخواست‌های بیش از حد مجاز جلوگیری می‌کند.
 * 
 * @param {import("next/server").NextRequest} req - شیء درخواست
 * @returns {Promise<void>} Promise که در صورت مجاز بودن درخواست resolve می‌شود
 * 
 * @throws {Object} خطای محدودیت دسترسی:
 * @throws {Object} 429 - اگر تعداد درخواست‌ها بیش از حد مجاز باشد
 * 
 */

export default async function block(req) {
    return new Promise((resolve, reject) => {
        // دریافت آی‌پی کاربر
        const ip = (req.ip || req.headers.get('x-forwarded-for')) ?? '127.0.0.1'
        // دریافت تعداد تلاش‌های ناموفق
        let attempts = Number(cache.get(ip + 'attempts')) || 0;
        // دریافت تعداد دفعاتی که کاربر باید منتظر بماند
        let retry = Number(cache.get(ip + 'retry')) || 0;

        // اگر تعداد تلاش‌ها بیش از ۱۰ باشد
        if (attempts >= 10) {
            // اگر کاربر باید منتظر بماند
            if(!retry) cache.set(ip + 'retry', 1, 60 * 60);
            return reject({message: `شما بیش از حد مجاز تلاش کرده‌اید. لطفاً تا اتمام زمان ۱ ساعته منتظر بمانید `, status: 429});
        } 
        // اگر کاربر باید منتظر بماند
        else if (retry >= 1) {
            return reject({message: `شما بیش از حد مجاز تلاش کرده‌اید. لطفاً تا اتمام زمان ۱ ساعته منتظر بمانید `, status: 429});
        }

        // اگر درخواست از نوع POST یا PUT باشد، تعداد تلاش‌ها را افزایش دهید
        if(req.method === 'POST' || req.method === 'PUT') cache.set(ip + 'attempts', attempts + 1, 10);

        resolve()
    })
}

