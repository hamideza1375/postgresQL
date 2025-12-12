import { createReadStream } from 'fs';
import { join } from 'path';
import { NextRequest } from 'next/server';

// تابع GET برای پاسخ به درخواست‌ها
export async function GET(req: NextRequest): Promise<Response> {
    try {
        // دریافت نام فایل از پارامترهای جستجو
        const fileName = req.nextUrl.searchParams.get('filename');
        
        // بررسی وجود نام فایل
        if (!fileName) {
            return new Response(JSON.stringify({ error: 'Filename parameter is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // ساخت مسیر فایل با استفاده از نام فایل
        const filePath = join(process.cwd(), 'assets/uploads/product/', fileName);

        // ایجاد جریان خواندن فایل
        const stream = createReadStream(filePath);

        // تنظیم هدرهای پاسخ
        const headers = new Headers();
        headers.set('Content-Type', 'video/mp4');

        // ایجاد جریان خواندن قابل خواندن
        const readableStream = new ReadableStream({
            start(controller) {
                // افزودن داده‌ها به جریان
                stream.on('data', (chunk) => {
                    controller.enqueue(new Uint8Array(chunk as Buffer));
                });
                
                // بستن جریان در پایان
                stream.on('end', () => {
                    controller.close();
                });
                
                // مدیریت خطاها
                stream.on('error', (err: Error) => {
                    controller.error(err);
                    stream.destroy();
                });
            },
            
            cancel() {
                stream.destroy();
            }
        });

        // بازگشت پاسخ با جریان خواندن
        return new Response(readableStream, {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('Error in file streaming:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}