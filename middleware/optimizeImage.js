import { headers } from 'next/headers';
import sharp from 'sharp';


/**
 * تابع بهینه‌سازی و ذخیره تصاویر با قابلیت تشخیص مسیر ذخیره‌سازی
 * 
 * @function optimizeImage
 * @description این تابع تصاویر را بر اساس مسیر ارجاع دهنده (referer) در دایرکتوری مناسب ذخیره می‌کند.
 * تصاویر را بر اساس اندازه‌شان بهینه‌سازی می‌کند و در فرمت webp ذخیره می‌نماید.
 * 
 * @param {File} image - شیء فایل تصویر ورودی
 * @returns {Promise<string|null>} Promise که در صورت موفقیت با نام فایل resolve می‌شود
 * یا در صورت خطا reject می‌شود. اگر تصویر معتبر نباشد null برمی‌گرداند.
 * 
 * @throws {Object} خطاهای پردازش تصویر:
 * @throws {Object} 400 - اگر عملیات آپلود و پردازش تصویر با خطا مواجه شود
 * @throws {Object} 413 - اگر حجم تصویر بیش از حد مجاز باشد (به صورت ضمنی)
 * 
 * @example
 * // استفاده در route
 * app.post('/upload-image', async (req, res) => {
 *   const image = req.files?.image;
 *   try {
 *     const filename = await optimizeImage(image);
 *     res.json({ filename });
 *   } catch (error) {
 *     res.status(error.status || 500).json({ message: error.message });
 *   }
 * });
 */

export default function optimizeImage(image) {
    if (image?.size) {
        return new Promise(async (resolve, reject) => {
            const _headers = headers();

            let fileDir;
            // بررسی مسیر ارجاع دهنده برای تعیین دایرکتوری فایل
            if (_headers.get('referer').includes('tickets')) fileDir = process.cwd() + '/assets/uploads/ticket/';
            else if (_headers.get('referer').includes('questions'))
                fileDir = process.cwd() + '/assets/uploads/question/';

            try {
                let buffer = Buffer.from(await image.arrayBuffer());
                // تولید نام فایل به صورت تصادفی
                let filename =
                    Date.now().toString('32') + '' + Math.floor(Math.random() * 999999 + 100000) + '.webp';
                const sharpImage = sharp(buffer);

                const { width, height, format, size } = await sharpImage.metadata();

                // بررسی اندازه تصویر و انجام عملیات بهینه‌سازی
                if (size <= 500) {
                    await sharp(buffer).toFile(fileDir + filename);
                } else if (size <= 1000000) {
                    await sharp(buffer)
                        .resize({
                            width: Math.floor(width / 2),
                            height: Math.floor(height / 2),
                            fit: 'cover'
                        })
                        .webp({ quality: 90 })
                        .toFile(fileDir + filename);
                } else if (size <= 1500000) {
                    await sharp(buffer)
                        .resize({
                            width: Math.floor(width / 3),
                            height: Math.floor(height / 3),
                            fit: 'cover'
                        })
                        .webp({ quality: 80 })
                        .toFile(fileDir + filename);
                } else if (size > 1500000) {
                    await sharp(buffer)
                        .resize({
                            width: Math.floor(width / 4),
                            height: Math.floor(height / 4),
                            fit: 'cover'
                        })
                        .webp({ quality: 70 })
                        .toFile(fileDir + filename);
                }

                /* const {format, width, height, premultiplied, size } = */
                resolve(filename);
            } catch {
                // در صورت بروز خطا در آپلود تصویر
                reject({ message: 'تصویر آپلود نشد', status: 400 });
            }
        });
    } else return null;
}
// 500 Internal Server Error: این کد نشان‌دهنده مشکلی در سرور است که باعث ناموفقیت در ذخیره‌سازی تصویر می‌شود
// 413 Request Entity Too Large: اگر تصویر بسیار بزرگ باشد، این کد نشان‌دهنده این است که سرور قادر به پردازش درخواست نیست.
