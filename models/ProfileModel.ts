import { db } from '@/utils/dbConnect';
import { DataTypes, Model } from 'sequelize';

// Interface for Profile attributes
interface ProfileAttributes {
  id?: number;
  imageUrl: string;
  userId: number;
}

// Profile model class
class Profile extends Model<ProfileAttributes> implements ProfileAttributes {
  public id!: number;
  public imageUrl!: string;
  public userId!: number;
}

Profile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      // field: '_id',
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "آدرس تصویر نمی‌تواند خالی باشد"
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: {
        name: "unique_user_profile",
        msg: 'برای این کاربر قبلاً پروفایل ایجاد شده است'
      },
      references: {
        model: 'users',
        key: 'id',
      }
    },
  },
  {
    sequelize: db,
    modelName: 'Profile',
    tableName: 'profiles',
    timestamps: true,
  }
);

export default Profile;