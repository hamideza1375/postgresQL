import { DataTypes, Model, Op } from 'sequelize';
import { db } from '@/utils/dbConnect';
import { CustomError } from '@/utils/CustomError';
import crypto from 'crypto';
import { getScryptParams } from '@/utils/getScryptParams';

// ویژگی‌های مربوط به کاربر
interface UserAttributes {
  id?: number;
  username?: string;
  email: string;
  phone?: string;
  password: string;
  isAdmin?: number;
  products?: any[];
  blocked?: number;
  address?: string;
  city?: string;
  postalCode?: string;
  latlng?: object;
  lastLogin?: Date;
  passwordChangedAt?: Date;
}

const { N, r, p } = getScryptParams();
const keyLength = 64;

// مدل کاربر
class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public phone!: string;
  public password!: string;
  public isAdmin!: number;
  public products!: any[];
  public blocked!: number;
  public address!: string;
  public city!: string;
  public postalCode!: string;
  public latlng!: object;
  public lastLogin!: Date;
  public passwordChangedAt!: Date;


  // متد مقایسه رمز عبور
  public async comparePassword(candidatePassword: string): Promise<void> {
    const [salt, hashedPassword] = this.dataValues.password.split(':');

      console.log('hashedPassword', hashedPassword);
      console.log('-----------------');

    try {
      const derivedKey = await new Promise<string>((resolve, reject) => {
        crypto.scrypt(candidatePassword, salt, keyLength, { N, r, p }, (err, derivedKey) => {
          if (err) reject(err);
          resolve(derivedKey.toString('hex'));
        });
      });

      console.log('-----------------');
      console.log('derivedKey', derivedKey);
      

      if (hashedPassword !== derivedKey) {
        throw new CustomError({ message: 'مشخصات وارد شده اشتباه است', status: 400 });
      }
    } catch (err) {
      throw new CustomError({ message: 'خطا در بررسی رمز عبور', status: 500 });
    }
  }
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
      allowNull: true,
      validate: {
        len: {
          args: [3, 12],
          msg: 'نام کاربری باید حداقل ۳ و حداکثر ۱۲ کاراکتر باشد',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: "email_unique",
        msg: 'ایمیل وارد شده تکراری است'
      },
      validate: {
        isEmail: {
          msg: 'لطفا یک ایمیل معتبر وارد کنید',
        },
        notEmpty: {
          msg: 'ایمیل الزامی است',
        },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: {
        name: "phone_unique",
        msg: 'شماره تماس وارد شده تکراری است'
      },
      validate: {
        is: {
          args: /^\d{11}$/,
          msg: 'شماره تلفن باید ۱۱ رقم باشد',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 16],
          msg: 'رمز عبور باید حداقل ۶ و حد اکثر ۱۶ کارکتر باشد',
        },
        notEmpty: {
          msg: 'رمز عبور الزامی است',
        },
      },
    },
    isAdmin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    products: {
      type: DataTypes.JSONB,
      defaultValue: [{ productId: '', version: '' }],
    },
    blocked: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [10, 10],
          msg: 'کد پستی باید ۱۰ رقم باشد',
        },
      },
    },
    latlng: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  },
  {
    sequelize: db,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        unique: true,
        fields: ['phone'],
        where: {
          phone: {
            [Op.ne]: null,
          },
        },
      },
    ],
  }
);

// هوک قبل از ذخیره برای هش کردن رمز عبور
// هوک قبل از ذخیره برای هش کردن رمز عبور
User.addHook('beforeSave', async (user: User) => {
  if (!user.changed('password')) return;
  
  // بررسی وجود رمز عبور
  if (!user.dataValues.password || typeof user.dataValues.password !== 'string') {
    throw new Error('Password is required and must be a string');
  }

  const { N, r, p } = getScryptParams();
  const keyLength = 64;
  const salt = crypto.randomBytes(16).toString('hex');

  return new Promise<void>((resolve, reject) => {
    crypto.scrypt(user.dataValues.password, salt, keyLength, { N, r, p }, (err, derivedKey) => {
      if (err) return reject(err);

      user.setDataValue('password', `${salt}:${derivedKey.toString('hex')}`)
      resolve();
    });
  });
});

// // هوک بعد از ذخیره برای مدیریت خطاهای تکراری بودن
// User.addHook('afterSave', async (user: User, options: any) => {
//   // این هوک فقط برای نمایش نحوه مدیریت خطا اضافه شده است
//   // در عمل، مدیریت خطا در سطح بالاتر انجام می‌شود
// });

export default User;