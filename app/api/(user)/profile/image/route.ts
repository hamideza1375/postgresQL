import errorHandling from '@/middleware/errorHandling';
import ProfileModel from '@/models/ProfileModel';
import {dbConnect} from '@/utils/dbConnect';
import getUser from '@/utils/getUser';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';



/**
 * این تابع برای آپلود تصویر پروفایل می باشد
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    return errorHandling(async (): Promise<NextResponse> => {
        await dbConnect();
        
        const _user = getUser(req);
        const formdata = await req.formData();
        // const { image }: {image?:File} = Object.fromEntries(formdata.entries());
        const { image } = Object.fromEntries(formdata.entries()) as { image?: File };
        
        if (!image) {
            return NextResponse.json('بعدا دوباره امتحان کنید', { status: 400 });
        }

        // اگر پروفایل قبلا داشته باشد آن را حذف می کند
        const profileImage = await ProfileModel.findOne({ 
            where: {
                userId: _user.userId
            }
        });
        
        if (profileImage) {
            const imagePath = path.join(process.cwd(), 'assets/uploads/profile/' + profileImage.imageUrl);
            if (existsSync(imagePath)) {
                unlinkSync(imagePath);
            }
        }
        
        // سپس پروفایل قبلی را حذف می کند
        await ProfileModel.destroy({ 
            where: {
                userId: _user.userId
            }
        });

        // تصویر را در فرمتی که میخواهیم تبدیل می کنیم
        const buffer: Buffer = Buffer.from(await image.arrayBuffer());
        
        // نام فایل را ایجاد می کنیم
        const filename: string = Date.now().toString(32) + '' + Math.floor(Math.random() * 99999 + 10000) + '_' + image.name.replace(/\s+/g, '_');
        
        // تصویر را در سرور ذخیره می کنیم
        const uploadPath = path.join(process.cwd(), 'assets/uploads/profile/', filename);
        writeFileSync(uploadPath, buffer);

        // پروفایل جدید را در دیتابیس ثبت می کنیم
        await ProfileModel.create({ 
            imageUrl: filename, 
            userId: _user.userId 
        });

        return NextResponse.json({ 
            message: 'تصویر با موفقیت بروزرسانی شد', 
            imageUrl: filename 
        });
    });
}

/**
 * این تابع برای دریافت تصویر پروفایل می باشد
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    await dbConnect();
    const _user = getUser(req);

    // پروفایل کاربر را دریافت می کنیم
    const profile = await ProfileModel.findOne({ 
        where: {
            userId: _user.userId
        },
        attributes: { exclude: ['userId'] } // معادل select({ user: 0 }) در Mongoose
    });

    // اگر پروفایل داشته باشد آن را بر میگرداند
    if (profile) {
        return NextResponse.json(profile);
    }
    
    // در غیر این صورت خالی بر میگرداند
    return NextResponse.json(null);
}