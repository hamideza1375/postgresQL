import ProductsModel from '@/models/ProductModel';
import {dbConnect} from '@/utils/dbConnect';

export async function GET(req: Request, { params: {id} }: { params: { id: string } }) {
    await dbConnect()
    
    // بررسی وجود id
    if (!id) {
        return Response.json({ error: 'شناسه محصول الزامی است' }, { status: 400 });
    }
    
    let product = await ProductsModel.findByPk(parseInt(id), {
        attributes: {
            exclude: ['comments', 'questions', 'parts', 'stars']
        }
    })
    
    if(!product) {
        return Response.json({ error: 'محصول یافت نشد' }, { status: 404 });
    }
    
    return Response.json(product);
}