/**
 * این تابع برای دریافت لیست آخرین پرداخت های کاربر است
 * ابتدا دیتابیس را کانکت می کند
 * سپس با استفاده از میانی افزار authUserRoutes چک می کند که آیا کاربر لاگین کرده است یا خیر
 * اگر لاگین کرده بود، اطلاعات کاربر را از هدر می گیرد
 * سپس با استفاده از مدل PaymentsModel لیست آخرین پرداخت های کاربر را دریافت می کند
 * و آن را به صورت آرایه ای از آبجکت ها بر می گرداند
 */
import authUserRoutes from '@/middleware/authUserRoutes';
import errorHandling from '@/middleware/errorHandling';
import PaymentsModel from '@/models/PaymentsModel';
import { dbConnect } from '@/utils/dbConnect';
import getUser from '@/utils/getUser';
import { NextRequest, NextResponse } from 'next/server';



export async function GET(req: NextRequest): Promise<NextResponse> {
    return errorHandling(async (): Promise<NextResponse> => {
        await dbConnect();
        
        // Check if user is logged in
        await authUserRoutes();
        
        // Get user info from headers
        const _user = getUser(req)

        // Get user's last successful payments sorted by date
        const lastPayment = await PaymentsModel.findAll({ 
            where: {
                success: true, 
                userId: Number(_user.userId)
            },
            order: [['createdAt', 'DESC']]
        });


        // Return the list as JSON
        return NextResponse.json(lastPayment);
    });
}