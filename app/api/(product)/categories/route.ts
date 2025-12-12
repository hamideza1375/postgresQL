import CategoriesModel from "@/models/CategoriesModel";
import {dbConnect} from "@/utils/dbConnect";

export async function GET(req: Request): Promise<Response> {
    await dbConnect()
    let category = await CategoriesModel.findAll();
    return Response.json(category);
}