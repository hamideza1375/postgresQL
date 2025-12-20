import { db } from '@/utils/dbConnect';
import { DataTypes, Model } from 'sequelize';
import User from './UsersModel';

// تعریف انواع مختلف برای محصولات


// مدل Answer
interface AnswerAttributes {
  id?: number;
  username: string;
  message: string;
  to: string;
  commentId: number;
  isActive: boolean;
}

class Answer extends Model<AnswerAttributes> implements AnswerAttributes {
  public id!: number;
  public username!: string;
  public message!: string;
  public to!: string;
  public commentId!: number;
  public isActive!: boolean;
}

Answer.init(
  {
    id: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
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
  id?: number;
  username: string;
  message: string;
  show?: boolean;
  rating: number;
  userId: number;
  likeCount: number;
  productId: number;
  isActive?: boolean;
}

class Comment extends Model<CommentAttributes> implements CommentAttributes {
  public id!: number;
  public username!: string;
  public message!: string;
  public show!: boolean;
  public rating!: number;
  public userId!: number;
  public likeCount!: number;
  public productId!: number;
  public isActive!: boolean;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
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
  id?: number;
  urls?: string;
  title: string;
  info: string;
  price: number;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  categoryId: number;
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
  public id!: number;
  public urls!: string;
  public title!: string;
  public info!: string;
  public price!: number;
  public description!: string;
  public imageUrl!: string;
  public videoUrl!: string;
  public categoryId!: number;
  public popular!: boolean;
  public offer!: {
    exp: number;
    value: number;
  };
  public stock!: number;
  public rating!: number;
  public ratings!: number;
  public metaTitle!: string;
  public metaDescription!: string;
  public metaKeywords!: string[];
  public isActive!: boolean;
  public free!: boolean;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
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