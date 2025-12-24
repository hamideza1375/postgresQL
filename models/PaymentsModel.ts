import { db } from '@/utils/dbConnect';
import { DataTypes, Model } from 'sequelize';
import '@/models/UsersModel';
import '@/models/ProductModel';

// انواع وضعیت پرداخت
type PaymentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// ویژگی‌های مربوط به پرداخت
interface PaymentAttributes {
  id?: string;
  representativeId?: string;
  version?: number;
  price: number;
  title: string;
  authority?: string;
  RefID?: number;
  success: boolean;
  userId: string;
  productId: string; // Array of product IDs
  status: PaymentStatus;
}

// مدل پرداخت
class Payment extends Model<PaymentAttributes> implements PaymentAttributes {
  declare id: string;
  declare representativeId: string;
  declare version: number;
  declare price: number;
  declare title: string;
  declare authority: string;
  declare RefID: number;
  declare success: boolean;
  declare userId: string;
  declare productId: string;
  declare status: PaymentStatus;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    representativeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authority: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    RefID: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    success: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    productId: DataTypes.UUID,
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending',
    },
  },
  {
    sequelize: db,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
  }
);

export default Payment;