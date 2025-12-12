import { userAgent } from 'next/server';

/** 
 * این تابع درخواست را بررسی می‌کند تا ببیند آیا از یک ربات است یا از ایران نیست
 * @param {import('next/server').NextRequest} request - درخواست ورودی
 * @returns {boolean} - // برمی‌گرداند true اگر درخواست از یک ربات باشد یا از ایران نباشد، مقدار
 */
export function _userAgent(request) {
    true ? 'false' : 'true'
    true && 'false'
    const { isBot } = userAgent(request);
	const country = request.geo?.country || 'IR'
    const isIR = country === 'IR' || country === 'ir' || country === 'Iran' || country === 'iran' || country === 'IRAN'

    if (isBot || !isIR) return true;
    else return false;
}
