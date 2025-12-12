// وارد کردن ماژول‌های مورد نیاز
import { createReadStream } from 'fs';
import { NextResponse } from 'next/server';
import { join } from 'path';
import { Readable } from 'stream';

// تعریف تابع GET برای پاسخ به درخواست‌های GET
export async function GET(req: import('next/server').NextRequest) {
    // دریافت نام فایل از پارامترهای URL
    const fileName = req.nextUrl.searchParams.get('url');

    // ساخت مسیر کامل فایل با استفاده از نام فایل و مسیر پوشه
    const filePath = join(process.cwd(), 'assets/uploads/ticket/' + fileName);

    // ایجاد جریان خواندن فایل
    const readStream = createReadStream(filePath);
    const stream = Readable.toWeb(readStream) as ReadableStream;

    // بازگشت پاسخ با جریان فایل و وضعیت 200
    return new NextResponse(stream, { status: 200 });
}
