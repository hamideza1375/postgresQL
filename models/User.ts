import { db } from '@/utils/dbConnect';
import { DataTypes, Model } from 'sequelize';

// ویژگی‌های مربوط به کاربر
interface UserAttributes {
  id?: string; // تغییر از number به string
  username: string;
  email: string;
  password: string;
  // سایر فیلدها...
}

// مدل کاربر
class User extends Model<UserAttributes> implements UserAttributes {
  declare id: string; // تغییر از number به string
  declare username: string;
  declare email: string;
  declare password: string;
  // سایر فیلدها...
}

User.init(
  {
    id: {
      type: DataTypes.UUID, // استفاده از UUID
      defaultValue: DataTypes.UUIDV4, // تولید خودکار UUID
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // سایر فیلدها...
  },
  {
    sequelize: db,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

export default User;