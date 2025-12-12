import sharp from 'sharp';


/**
 * تابع بهینه‌سازی و ذخیره تصویر گواهی
 * 
 * @description این تابع تصاویر گواهی را دریافت کرده، آن‌ها را به فرمت بهینه تبدیل می‌کند و ذخیره می‌نماید.
 * تصاویر خروجی با فرمت webp و با نام منحصر به فرد ذخیره می‌شوند.
 * 
 * @param {File} image - شیء فایل تصویر ورودی
 * @returns {Promise<string|null>} Promise که در صورت موفقیت با نام فایل resolve می‌شود
 * یا در صورت خطا reject می‌شود. اگر تصویر معتبر نباشد null برمی‌گرداند.
 * 
 * @throws {Object} خطاهای پردازش تصویر:
 * @throws {Object} 400 - اگر عملیات آپلود و پردازش تصویر با خطا مواجه شود
 */

// تابعی برای بهینه سازی تصویر گواهی
export default function imageUpload(image) {
    // بررسی می کند که آیا تصویر دارای اندازه است یا خیر
    if (image?.size) {
        return new Promise(async (resolve, reject) => {
            // مسیر دایرکتوری فایل
            let fileDir = process.cwd() + '/assets/uploads/certificate/';
            try {
                // تبدیل تصویر به بافر
                let buffer = Buffer.from(await image.arrayBuffer());
                // تولید نام فایل منحصر به فرد
                let filename = Date.now().toString('32') + '' + Math.floor(Math.random() * 999999 + 100000) + '.webp';
                // ذخیره تصویر بهینه شده
                await sharp(buffer).toFile(fileDir + filename);
                resolve(filename);
            } catch {
                // در صورت بروز خطا
                reject({ message: 'تصویر آپلود نشد', status: 400 });
            }
        });
    } else return null; // اگر تصویر اندازه نداشته باشد، مقدار null برمی‌گرداند
}
