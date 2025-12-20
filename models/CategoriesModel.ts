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
  id?: number;
  title: string;
  imageUrl: string;
  isActive: boolean;
}

// مدل دسته‌بندی
class Category extends Model<CategoryAttributes> implements CategoryAttributes {
  public id!: number;
  public title!: string;
  public imageUrl!: string;
  public isActive!: boolean;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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