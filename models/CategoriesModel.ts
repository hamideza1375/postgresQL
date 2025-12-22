// // در فایل route مربوطه
// const categories = await Category.findAll();

// // استفاده از متد سفارشی برای تبدیل داده‌ها
// const categoriesForClient = Category.toJSONWithUnderscoreIdArray(categories);

// // ارسال به کلاینت
// res.json(categoriesForClient);

///////////

import { db } from '@/utils/dbConnect';
import { DataTypes, Model } from 'sequelize';


// ویژگی‌های مربوط به دسته‌بندی
interface CategoryAttributes {
  id?: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
}

// مدل دسته‌بندی
class Category extends Model<CategoryAttributes> implements CategoryAttributes {
  declare id: string;
  declare title: string;
  declare imageUrl: string;
  declare isActive: boolean;
}

Category.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'unique_category_title',
        msg: 'دسته بندی با این عنوان قبلا ثبت شده است',
      },
      validate: {
        notEmpty: {
          msg: 'لطفا نام دسته‌بندی را وارد کنید',
        },
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize: db,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
  }
);

export default Category;