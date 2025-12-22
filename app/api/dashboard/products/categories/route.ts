import authAdminRoutes from '@/middleware/authAdminRoutes';
import errorHandling from '@/middleware/errorHandling';
import Category from '@/models/CategoriesModel';
import { dbConnect } from '@/utils/dbConnect';
import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

// تابع POST برای ایجاد دسته‌بندی جدید
export async function POST(req: NextRequest): Promise<NextResponse> {
    return errorHandling(async () => {
        await dbConnect();
        await authAdminRoutes();

        const formData = await req.formData();
        const file = formData.get('image') as File | null;
        const title = formData.get('title') as string | null;

        // اعتبارسنجی فایل
        if (!file || !title) {
            return NextResponse.json(
                { error: 'عنوان و تصویر الزامی هستند' },
                { status: 400 }
            );
        }

        // اعتبارسنجی نوع فایل
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'فایل باید یک تصویر باشد' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now().toString(32)}${Math.floor(Math.random() * 89999 + 10000)}_${file.name.replace(/\s+/g, '_')}`;
        const uploadPath = path.join(process.cwd(), 'assets/uploads/product/', filename);

        try {
            await writeFile(uploadPath, buffer);
        } catch (error) {
            console.error('خطا در ذخیره فایل:', error);
            return NextResponse.json(
                { error: 'خطا در ذخیره تصویر' },
                { status: 500 }
            );
        }

        const category = await Category.create({
            title,
            imageUrl: filename,
            isActive: true
        });

        return NextResponse.json(
            {
                message: 'دسته‌بندی با موفقیت ایجاد شد',
                data: category
            },
            { status: 201 }
        );
    })
}

// تابع GET برای دریافت دسته‌بندی‌ها
export async function GET(req: NextRequest): Promise<NextResponse> {
    return errorHandling(async () => {
        await dbConnect();
        await authAdminRoutes();

        const categories = await Category.findAll({
            where: {
                isActive: true
            }
        });

        return NextResponse.json(categories);
    })
}