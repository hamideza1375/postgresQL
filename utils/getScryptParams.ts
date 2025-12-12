import os from 'os';

interface ScryptParams {
    N: number;
    r: number;
    p: number;
  }

/**
 * تابع تنظیم پارامترهای الگوریتم scrypt بر اساس منابع سیستم
 * 
 * @function getScryptParams
 * @description این تابع منابع سیستم (حافظه) را بررسی کرده و پارامترهای بهینه
 * برای الگوریتم هش‌سازی scrypt را محاسبه می‌کند. این کار برای اطمینان از عملکرد
 * بهینه سیستم در شرایط مختلف سخت‌افزاری انجام می‌شود.
 * 
 * @property {number} N - پارامتر هزینه حافظه (تعداد تکرارها)
 * @property {number} r - پارامتر اندازه بلوک
 * @property {number} p - پارامتر موازی‌سازی
 * @returns {ScryptParams} شیء حاوی پارامترهای بهینه‌شده scrypt
 * 
 * @example
 * // دریافت پارامترهای بهینه‌شده
 * const { N, r, p } = getScryptParams();
 * // استفاده در الگوریتم scrypt
 * const hash = await scrypt(password, salt, { N, r, p });
 */

export function getScryptParams(): ScryptParams {
    const totalMemoryGB: number = os.totalmem() / 1024 / 1024 / 1024; // کل حافظه سیستم به گیگابایت
    const freeMemoryGB: number = os.freemem() / 1024 / 1024 / 1024; // حافظه آزاد سیستم به گیگابایت

    console.log(`Total Memory: ${totalMemoryGB.toFixed(2)} GB`);
    console.log(`Free Memory: ${freeMemoryGB.toFixed(2)} GB`);

    // تنظیم پارامترهای scrypt بر اساس حافظه سیستم
    let N: number, r: number, p: number;

    if (totalMemoryGB >= 8 && freeMemoryGB >= 4) {
        // اگر سیستم حافظه کافی دارد، از پارامترهای پیش‌فرض استفاده کنید
        N = 16384; // هزینه حافظه
        r = 8;     // اندازه بلوک
        p = 1;     // موازی‌سازی
    } else if (totalMemoryGB >= 4 && freeMemoryGB >= 2) {
        // اگر سیستم حافظه متوسطی دارد، پارامترها را کاهش دهید
        N = 8192;
        r = 8;
        p = 1;
    } else {
        // اگر سیستم حافظه کمی دارد، پارامترها را بیشتر کاهش دهید
        N = 4096;
        r = 8;
        p = 1;
    }

    console.log(`Using scrypt params: N=${N}, r=${r}, p=${p}`);
    return { N, r, p };
}