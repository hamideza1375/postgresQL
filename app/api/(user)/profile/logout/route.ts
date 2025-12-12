import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
    const cookieStore = await cookies();

    // Remove authentication cookies
    cookieStore.delete('token');
    cookieStore.delete('httpToken');

    // Return empty response with 202 Accepted status
    return NextResponse.json('', { status: 202 });
}


