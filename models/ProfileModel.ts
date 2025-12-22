import { db } from '@/utils/dbConnect';
import { DataTypes, Model } from 'sequelize';
import '@/models/UsersModel';

// Interface for Profile attributes
interface ProfileAttributes {
  id?: string;
  imageUrl: string;
  userId: string;
}

// Profile model class
class Profile extends Model<ProfileAttributes> implements ProfileAttributes {
  declare id: string;
  declare imageUrl: string;
  declare userId: string;
}

Profile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
      type: DataTypes.UUID,
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