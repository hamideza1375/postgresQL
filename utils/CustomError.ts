
/**
 * کلاس خطای سفارشی برای مدیریت خطاهای با وضعیت HTTP
 * @export
 * @class CustomError
 * @extends {Error}
 */
export class CustomError extends Error {
    /**
     * کد وضعیت HTTP خطا
     * @type {number}
     */
    public readonly status: number;

    /**
     * ایجاد یک نمونه از CustomError
     * @constructor
     * @param {Object} options - گزینه‌های خطا
     * @param {string} [options.message=''] - پیام خطا
     * @param {number} [options.status=500] - کد وضعیت HTTP
     * @throws {TypeError} اگر پارامتر status عدد نباشد
     */
    constructor({ message = '', status = 500 }: { message?: string; status?: number } = {}) {
        super(message);

        // اعتبارسنجی نوع status
        if (typeof status !== 'number') {
            throw new TypeError('Status must be a number');
        }

        this.status = status;

        // تنظیم prototype برای حفظ زنجیره prototype
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}