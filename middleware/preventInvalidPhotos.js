// حداکثر طول محتوا برای درخواست‌ها
const MAX_CONTENT_LENGTH = 2000500;
const MAX_CONTENT_LENGTH2 = 5000000;


/**
 * میان‌افزار بررسی و محدودیت اندازه محتوای درخواست‌ها
 * 
 * @async
 * @function preventInvalidPhotos
 * @description این تابع اندازه محتوای درخواست‌های POST و PUT را بررسی می‌کند
 * و در صورت اندازه ی بزرگ تر از حد مجاز، آن را مسدود می‌نماید. برای مسیرهای مختلف
 * محدودیت‌های متفاوتی اعمال می‌کند.
 * 
 * @param {import("next/server").NextRequest} request - شیء درخواست ورودی
 * @returns {Promise<string|void>} Promise که در صورت اندازه ی بزرگ تر از حد مجاز
 * با مقدار 'MAX_LENGTH' resolve می‌شود، در غیر این صورت بدون مقدار resolve می‌شود
 * 
 * @constant {number} MAX_CONTENT_LENGTH - حداکثر اندازه مجاز برای اکثر مسیرها (2,000,500 بایت)
 * @constant {number} MAX_CONTENT_LENGTH2 - حداکثر اندازه مجاز برای مسیر my-purchases (5,000,000 بایت)
 * 
 * @example
 * // استفاده در میدلور
 * export async function middleware(){
 *   const result = await preventInvalidPhotos(req);
 *   if (result === 'MAX_LENGTH') {
 *     return res.status(413).json({ message: 'حجم درخواست بیش از حد مجاز است' });
 *   }
 *   return response;
 * }
 */

export async function preventInvalidPhotos(request) {
    return new Promise(async (resolve) => {
        // بررسی نوع درخواست
        if (request.method === 'POST' || request.method === 'PUT') {
            // بررسی آدرس URL درخواست
            if (!request.url.includes("/dashboard") && !request.url.includes("/my-purchases")) {
                const contentLength = +request.headers.get('Content-Length');
                // اگر طول محتوا بیشتر از حداکثر مجاز باشد
                if (contentLength > MAX_CONTENT_LENGTH) {
                    resolve('MAX_LENGTH');
                }
            }
            // بررسی آدرس URL درخواست برای "/my-purchases"
            else if (request.url.includes("/my-purchases")) {
                const contentLength = +request.headers.get('Content-Length');
                // اگر طول محتوا بیشتر از حداکثر مجاز باشد
                if (contentLength > MAX_CONTENT_LENGTH2) {
                    resolve('MAX_LENGTH');
                }
            }
        }
        resolve()
    });
}
