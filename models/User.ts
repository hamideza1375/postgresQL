import { db } from '@/utils/dbConnect';
import { DataTypes, Model } from 'sequelize';

interface UserAttributes {
  id?: number;
  username: string;
  email: string;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      // field: 'username',
      validate: {
        len: {
          args: [2, 50],
          msg: "نام شما نباید کمتر از ۲ حرف و بیشتر از ۵۰ حرف باشد"
        },
        is: {
          args: /^[^0-9]+$/i, // Regular expression to ensure name is not numeric
          msg: "در نام از اعداد انگلیسی استفاده نکنید"
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
          name: "SequelizeUniqueConstraintError",
          msg: 'ایمیل وارد شده تکراری است'
        },
      validate: {
        isEmail: {
          msg: 'ایمیل وارد شده نامعتبر است'
        }
      },
    },
  },
  {
    sequelize: db,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

export default User;