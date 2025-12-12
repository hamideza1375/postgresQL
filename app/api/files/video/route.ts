import dbConnect from '@/utils/dbConnect';
import { createReadStream, statSync } from 'fs';
import { decode } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { join } from 'path';
import { Headers } from 'next/dist/compiled/@edge-runtime/primitives';

// Type definitions
interface HttpUser {
    products?: {
        productId: string;
        // Add other product properties as needed
    }[];
}

interface ErrorWithStatus extends Error {
    status?: number;
}

// Dynamic route configuration
export const dynamic = 'force-dynamic';

/**
 * GET handler for video streaming
 * @param req - The incoming request
 * @returns Video stream or error response
 */
export async function GET(req: Request) {
    try {
        await dbConnect();

        // Extract and verify JWT token
        const cookieHeader = req.headers.get('cookie');
        const httpToken = cookieHeader?.split(';')
            .find(c => c.trim().startsWith('httpToken='))
            ?.split('=')[1];
        
        const httpUser = httpToken ? decode(httpToken) as HttpUser : null;

        // Get filename from query parameters
        const url = new URL(req.url);
        const fileName = url.searchParams.get('filename');

        if (!fileName) {
            return new NextResponse('Filename is required', { status: 400 });
        }

        // Extract product ID and chapter from filename
        const fileNameParts = fileName.split('_');
        const id = fileNameParts[fileNameParts.length - 2];
        const chapter = fileNameParts[fileNameParts.length - 3];
        const license = httpUser?.products?.find(p => p.productId === id);

        // Check access permissions
        if (id !== '667610dcca08b7215a5ba872') {
            if (!license && chapter !== '1') {
                // Return access denied video
                const filePath = join(process.cwd(), 'public/Inaccessibility.mp4');
                const videoSize = statSync(filePath).size;
                
                const headers = new Headers();
                headers.set('Content-Type', 'video/mp4');
                headers.set('Content-Length', videoSize.toString());
                
                const stream = createReadStream(filePath);
                return new NextResponse(stream as any, { 
                    status: 200, 
                    headers 
                });
            }
        }

        // Handle range requests for video streaming
        const filePath = join(process.cwd(), 'assets/uploads/product/', fileName);
        const fileStats = statSync(filePath);
        const videoSize = fileStats.size;

        const range = req.headers.get('range') || 'bytes=0-';
        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ''));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;

        // Set response headers
        const headers = new Headers();
        headers.set('Content-Range', `bytes ${start}-${end}/${videoSize}`);
        headers.set('Accept-Ranges', 'bytes');
        headers.set('Content-Length', contentLength.toString());
        headers.set('Content-Type', 'video/mp4');
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

        // Create read stream for the requested chunk
        const videoStream = createReadStream(filePath, { start, end });

        return new NextResponse(videoStream as any, {
            status: 206,
            headers
        });

    } catch (error) {
        const err = error as ErrorWithStatus;
        console.error('Video streaming error:', err);
        
        return new NextResponse(err.message || 'Internal Server Error', {
            status: err.status || 500
        });
    }
}