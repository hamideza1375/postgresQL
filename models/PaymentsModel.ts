import { db } from '@/utils/dbConnect';
import { DataTypes, Model } from 'sequelize';

// انواع وضعیت پرداخت
type PaymentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// ویژگی‌های مربوط به پرداخت
interface PaymentAttributes {
  id?: number;
  representativeId?: number;
  version: number;
  price: number;
  title: string;
  authority?: string;
  RefID?: string;
  success: boolean;
  userId: number;
  status: PaymentStatus;
}

// مدل پرداخت
class Payment extends Model<PaymentAttributes> implements PaymentAttributes {
  public id!: number;
  public representativeId!: number;
  public version!: number;
  public price!: number;
  public title!: string;
  public authority!: string;
  public RefID!: string;
  public success!: boolean;
  public userId!: number;
  public status!: PaymentStatus;
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    representativeId: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.DECIMAL(10, 2),
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
      type: DataTypes.INTEGER,
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
  id: number;
  paymentId: number;
  productId: number;
}

class PaymentProduct extends Model<PaymentProductAttributes> implements PaymentProductAttributes {
  public id!: number;
  public paymentId!: number;
  public productId!: number;
}

PaymentProduct.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'payments',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
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