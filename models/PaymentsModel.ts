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
  version: number;
  price: number;
  title: string;
  authority?: string;
  RefID?: string;
  success: boolean;
  userId: string;
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
  declare RefID: string;
  declare success: boolean;
  declare userId: string;
  declare status: PaymentStatus;
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
      type: DataTypes.STRING,
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

// جدول میانی برای رابطه many-to-many بین Payment و Product
interface PaymentProductAttributes {
  id: string;
  paymentId: string;
  productId: string;
}

class PaymentProduct extends Model<PaymentProductAttributes> implements PaymentProductAttributes {
  declare id: string;
  declare paymentId: string;
  declare productId: string;
}

PaymentProduct.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    paymentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'payments',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
  },
  {
    sequelize: db,
    modelName: 'PaymentProduct',
    tableName: 'payment_products',
    timestamps: false,
  }
);

// تعریف رابطه بین جداول
Payment.belongsToMany(Product, {
  through: PaymentProduct,
  foreignKey: 'paymentId',
  otherKey: 'productId',
  as: 'products',
});

Product.belongsToMany(Payment, {
  through: PaymentProduct,
  foreignKey: 'productId',
  otherKey: 'paymentId',
  as: 'payments',
});

// وارد کردن مدل Product برای تعریف رابطه
import { Product } from './ProductModel';

export default Payment;
export { Payment, PaymentProduct };