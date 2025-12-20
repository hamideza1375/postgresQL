import { db } from '@/utils/dbConnect';
import { DataTypes, Model } from 'sequelize';
import User from './UsersModel';

// تعریف انواع مختلف برای محصولات


// مدل Answer
interface AnswerAttributes {
  id?: string;
  username: string;
  message: string;
  to: string;
  commentId: string;
  isActive: boolean;
}

class Answer extends Model<AnswerAttributes> implements AnswerAttributes {
  declare id: string;
  declare username: string;
  declare message: string;
  declare to: string;
  declare commentId: string;
  declare isActive: boolean;
}

Answer.init(
  {
    id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    commentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'comments',
        key: 'id',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize: db,
    modelName: 'Answer',
    tableName: 'answers',
    timestamps: true,
  }
);

// مدل Comment
interface CommentAttributes {
  id?: string;
  username: string;
  message: string;
  show?: boolean;
  rating: number;
  userId: string;
  likeCount: number;
  productId: string;
  isActive?: boolean;
}

class Comment extends Model<CommentAttributes> implements CommentAttributes {
  declare id: string;
  declare username: string;
  declare message: string;
  declare show: boolean;
  declare rating: number;
  declare userId: string;
  declare likeCount: number;
  declare productId: string;
  declare isActive: boolean;
}

Comment.init(
  {
    id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'پیام شما نباید خالی باشد',
        },
      },
    },
    show: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 0,
        max: 5,
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize: db,
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: true,
  }
);

// مدل Product
interface ProductAttributes {
  id?: string;
  urls?: string;
  title: string;
  info: string;
  price: number;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  categoryId: string;
  popular: boolean;
  offer: {
    exp: number;
    value: number;
  };
  stock: number;
  rating: number;
  ratings: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  isActive: boolean;
  free: boolean;
}

class Product extends Model<ProductAttributes> implements ProductAttributes {
  declare id: string;
  declare urls: string;
  declare title: string;
  declare info: string;
  declare price: number;
  declare description: string;
  declare imageUrl: string;
  declare videoUrl: string;
  declare categoryId: string;
  declare popular: boolean;
  declare offer: {
    exp: number;
    value: number;
  };
  declare stock: number;
  declare rating: number;
  declare ratings: number;
  declare metaTitle: string;
  declare metaDescription: string;
  declare metaKeywords: string[];
  declare isActive: boolean;
  declare free: boolean;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
    },
    urls: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'عنوان محصول اجباری است',
        },
      },
    },
    info: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'اطلاعات محصول اجباری است',
        },
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [1000],
          msg: 'قیمت نباید کوچکتر از ۱۰۰۰ باشد',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'توضیحات محصول اجباری است',
        },
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    popular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    offer: {
      type: DataTypes.JSONB,
      defaultValue: { exp: 0, value: 0 },
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 1,
      validate: {
        min: 0,
        max: 5,
      },
    },
    ratings: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    metaTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metaDescription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metaKeywords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    free: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize: db,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
  }
);

Comment.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// اضافه کردن رابطه بین Comment و User
Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments',
});

Comment.hasMany(Answer, {
  foreignKey: 'commentId',
  as: 'answers',
});

Answer.belongsTo(Comment, {
  foreignKey: 'commentId',
  as: 'comment',
});


export { Product, Comment, Answer };
export default Product;