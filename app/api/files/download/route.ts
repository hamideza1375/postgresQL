import dbConnect from '@/utils/dbConnect';
import { createReadStream } from 'fs';
import { decode } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { join } from 'path';
import { Readable } from 'stream';
import { Headers } from 'next/dist/compiled/@edge-runtime/primitives';

interface HttpUser {
    products?: {
        productId: string;
        // Add other product properties if needed
    }[];
    // Add other user properties if needed
}

interface ErrorWithStatus extends Error {
    status?: number;
}

/**
 * دریافت فایل
 * 
 * این قسمت فایل های product را دریافت می کند
 */
export async function GET(req: Request) {
    try {
        await dbConnect();
        
        // Decode user token
        const httpToken = req.headers.get('cookie')?.split(';')
            .find(c => c.trim().startsWith('httpToken='))?.split('=')[1];
        
        const httpUser = httpToken ? decode(httpToken) as HttpUser : null;
        
        const url = new URL(req.url);
        const fileName = url.searchParams.get('filename');

        // Validate filename
        if (!fileName) {
            return htmlResponse('نام فایل مشخص نشده است', 400);
        }

        const fileNameParts = fileName.split('_');
        const id = fileNameParts[fileNameParts.length - 2];
        const chapter = fileNameParts[fileNameParts.length - 3];
        const license = httpUser?.products?.find(p => p.productId === id);

        // Check access permission
        if (id !== '667610dcca08b7215a5ba872') {
            if (!license && chapter !== '1') {
                return htmlResponse('شما اجازه ی دسترسی ندارید', 403);
            }
        }

        // Get file path
        const filePath = join(process.cwd(), '/assets/uploads/product/', fileName);
        const fileType = fileName.split('.').pop()?.toLowerCase();

        // Set appropriate headers
        const headers = new Headers();
        headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
        headers.set('Cache-Control', 'private, max-age=31536000');

        // Set content type based on file extension
        switch (fileType) {
            case 'zip':
                headers.set('Content-Type', 'application/zip');
                break;
            case 'rar':
                headers.set('Content-Type', 'application/vnd.rar');
                break;
            case 'mp4':
                headers.set('Content-Type', 'video/mp4');
                break;
            case 'pdf':
                headers.set('Content-Type', 'application/pdf');
                break;
            default:
                headers.set('Content-Type', 'application/octet-stream');
        }

        // Create readable stream
        const readStream = createReadStream(filePath);
        const stream = Readable.toWeb(readStream) as ReadableStream;

        return new Response(stream, {
            status: 200,
            headers
        });

    } catch (error) {
        const err = error as ErrorWithStatus;
        const message = typeof err?.message === 'string' ? err.message : 'خطایی رخ داده است';
        return htmlResponse(message, err?.status || 500);
    }
}

/**
 * تولید پاسخ HTML
 */
function htmlResponse(message: string, status: number = 400): NextResponse {
    const html = `<!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>خطا</title>
            </head>
            <body>
                <h1 style="color:red;text-align:center">${message}</h1>
            </body>
        </html>`;

    return new NextResponse(html, {
        status,
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        }
    });
}