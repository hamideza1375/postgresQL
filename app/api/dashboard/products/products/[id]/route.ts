import { Product } from '@/models/ProductModel';
import authAdminRoutes from '@/middleware/authAdminRoutes';
import { dbConnect } from '@/utils/dbConnect';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';


interface ProductFormData {
    image?: File;
    video?: File;
    title: string;
    price: string;
    description: string;
    info: string;
}

// تابع GET برای دریافت اطلاعات محصول
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{id:any}> }
): Promise<NextResponse> {
    try {
        await dbConnect();
        await authAdminRoutes();


        // اعتبارسنجی شناسه محصول
        const { id: productId } = await params
        if (isNaN(productId)) {
            return NextResponse.json(
                { error: 'شناسه محصول نامعتبر است' },
                { status: 400 }
            );
        }

        const product = await Product.findByPk(productId);

        if (!product) {
            return NextResponse.json(
                { error: 'محصول یافت نشد' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error: any) {
        console.error('خطا در دریافت محصول:', error);
        return NextResponse.json(
            { error: error?.message || 'خطای سرور' },
            { status: error?.status || 500 }
        );
    }
}

// تابع PUT برای به‌روزرسانی اطلاعات محصول
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{id:number}> }
): Promise<NextResponse> {
    try {
        await dbConnect();
        await authAdminRoutes();

        // اعتبارسنجی شناسه محصول
        const {id:productId} = await params;

        if (isNaN(productId)) {
            return NextResponse.json(
                { error: 'شناسه محصول نامعتبر است' },
                { status: 400 }
            );
        }

        const product = await Product.findByPk(productId);

        if (!product) {
            return NextResponse.json(
                { error: 'این گزینه از سرور حذف شده است' },
                { status: 400 }
            );
        }

        const formData = await req.formData();
        const { image, video, title, price, description, info } = Object.fromEntries(
            formData.entries()
        ) as unknown as ProductFormData;

        let imageName: string | undefined;
        let videoName: string | undefined;

        // پردازش تصویر جدید
        if (image?.size) {
            // اعتبارسنجی نوع فایل
            if (!image.type.startsWith('image/')) {
                return NextResponse.json(
                    { error: 'فایل تصویر باید از نوع عکس باشد' },
                    { status: 400 }
                );
            }

            const buffer = Buffer.from(await image.arrayBuffer());
            const ext = path.extname(image.name);
            const baseName = path.basename(image.name, ext);
            imageName = `${baseName}_${Date.now().toString(32)}${ext}`;
            const imagePath = path.join(process.cwd(), 'assets/uploads/product/', imageName);

            // حذف تصویر قبلی
            if (product.imageUrl && existsSync(path.join(process.cwd(), 'assets/uploads/product/', product.imageUrl))) {
                unlinkSync(path.join(process.cwd(), 'assets/uploads/product/', product.imageUrl));
            }

            writeFileSync(imagePath, buffer);
        }

        // پردازش ویدیوی جدید
        if (video?.size) {
            // اعتبارسنجی نوع فایل
            if (!video.type.startsWith('video/')) {
                return NextResponse.json(
                    { error: 'فایل باید از نوع ویدیو باشد' },
                    { status: 400 }
                );
            }

            const buffer = Buffer.from(await video.arrayBuffer());
            const ext = path.extname(video.name);
            const baseName = path.basename(video.name, ext);
            videoName = `${baseName}_${Date.now().toString(32)}${ext}`;
            const videoPath = path.join(process.cwd(), 'assets/uploads/product/', videoName);

            // حذف ویدیوی قبلی
            if (product.videoUrl && existsSync(path.join(process.cwd(), 'assets/uploads/product/', product.videoUrl))) {
                unlinkSync(path.join(process.cwd(), 'assets/uploads/product/', product.videoUrl));
            }

            writeFileSync(videoPath, buffer);
        }

        // به‌روزرسانی اطلاعات محصول
        product.setAttributes({
            title,
            price: Number(price),
            description,
            info,
            ...(imageName && { imageUrl: imageName }),
            ...(videoName && { videoUrl: videoName })
        });

        await product.save();

        return NextResponse.json(
            { data: product },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('خطا در به‌روزرسانی محصول:', error);
        return NextResponse.json(
            { error: error?.message || 'خطای سرور' },
            { status: error?.status || 500 }
        );
    }
}

// تابع DELETE برای حذف محصول (کامنت شده)
/*
export async function DELETE(
    req: NextRequest,
    { params }: { params: Params }
): Promise<NextResponse> {
    try {
        await dbConnect();
        await authAdminRoutes(req);

        const productId = parseInt(params.id);
        if (isNaN(productId)) {
            return NextResponse.json(
                { error: 'شناسه محصول نامعتبر است' },
                { status: 400 }
            );
        }

        const product = await Product.findByPk(productId);
        
        if (!product) {
            return NextResponse.json(
                { error: 'محصول یافت نشد' },
                { status: 404 }
            );
        }

        // حذف فایل‌های مرتبط
        if (product.imageUrl && existsSync(path.join(process.cwd(), 'assets/uploads/product/', product.imageUrl))) {
            unlinkSync(path.join(process.cwd(), 'assets/uploads/product/', product.imageUrl));
        }

        if (product.videoUrl && existsSync(path.join(process.cwd(), 'assets/uploads/product/', product.videoUrl))) {
            unlinkSync(path.join(process.cwd(), 'assets/uploads/product/', product.videoUrl));
        }

        await product.destroy();

        return NextResponse.json(
            { message: 'محصول با موفقیت حذف شد' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('خطا در حذف محصول:', error);
        return NextResponse.json(
            { error: error?.message || 'خطای سرور' },
            { status: error?.status || 500 }
        );
    }
}
*/