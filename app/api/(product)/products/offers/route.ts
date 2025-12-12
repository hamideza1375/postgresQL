import ProductsModel from '@/models/ProductModel';
import {dbConnect} from '@/utils/dbConnect';
import { Op } from 'sequelize';

export async function GET() {
    await dbConnect()
    let offers = await ProductsModel.findAll({ 
        where: {
            'offer.exp': {
                [Op.gt]: new Date().getTime()
            }
        },
        order: [['createdAt', 'DESC']]
    });
    return Response.json(offers);
}