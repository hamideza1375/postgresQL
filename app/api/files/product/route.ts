import { createReadStream } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { Readable } from 'stream';


export async function GET(req: NextRequest) {
    // دریافت نام فایل از پارامترهای جستجوی URL
    const fileName = req.nextUrl.searchParams.get('url');

    // ایجاد مسیر کامل فایل با استفاده از نام فایل
    const filePath = join(process.cwd(), 'assets/uploads/product/' + fileName);

    // تنظیم هدرهای پاسخ
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=31536000');

    // خواندن محتوای فایل به صورت غیرهمزمان
    // Create readable stream
    const readStream = createReadStream(filePath);
    const stream = Readable.toWeb(readStream) as ReadableStream;

    // ارسال پاسخ با محتوای فایل و هدرهای مناسب
    return new NextResponse(stream, { status: 200, headers });
}