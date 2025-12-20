import { db } from '@/utils/dbConnect';
import { DataTypes, Model } from 'sequelize';

// تعریف انواع مختلف برای تیکت
export type TicketCategory = 'Technical' | 'Reversal' | 'Other';
export type TicketStatus = 'Open' | 'examination' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'high';

// تعریف ویژگی‌های پاسخ تیکت
interface AnswerTicketAttributes {
  id?: string;
  message?: string;
  imageUrl?: string;
  userId?: string;
  seenDate: Date;
}

// تعریف مدل پاسخ تیکت
class AnswerTicket extends Model<AnswerTicketAttributes> implements AnswerTicketAttributes {
  declare id: string;
  declare message: string;
  declare imageUrl: string;
  declare userId: string;
  declare seenDate: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

AnswerTicket.init(
  {
    id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    seenDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    sequelize: db,
    modelName: 'AnswerTicket',
    tableName: 'answer_tickets',
    timestamps: true,
  }
);

// تعریف ویژگی‌های تیکت اصلی
interface TicketAttributes {
  id: string;
  title: string;
  message?: string;
  imageUrl?: string;
  userSeen: boolean;
  adminSeen: boolean;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  closedAt?: Date;
  userId: string;
}

// تعریف مدل تیکت اصلی
class Ticket extends Model<TicketAttributes> implements TicketAttributes {
  declare id: string;
  declare title: string;
  declare message: string;
  declare imageUrl: string;
  declare userSeen: boolean;
  declare adminSeen: boolean;
  declare category: TicketCategory;
  declare status: TicketStatus;
  declare priority: TicketPriority;
  declare closedAt: Date;
  declare userId: string;
}

Ticket.init(
  {
    id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: "عنوان تیکت نمی‌تواند خالی باشد",
        },
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userSeen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    adminSeen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    category: {
      type: DataTypes.ENUM('Technical', 'Reversal', 'Other'),
      defaultValue: 'Other',
    },
    status: {
      type: DataTypes.ENUM('Open', 'examination', 'Closed'),
      defaultValue: 'Open',
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'high'),
      defaultValue: 'Medium',
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    }
  },
  {
    sequelize: db,
    modelName: 'Ticket',
    tableName: 'tickets',
    timestamps: true,
  }
);

// تعریف رابطه بین تیکت و پاسخ‌های آن
Ticket.hasMany(AnswerTicket, {
  foreignKey: 'ticketId',
  as: 'answers',
});

AnswerTicket.belongsTo(Ticket, {
  foreignKey: 'ticketId',
  as: 'ticket',
});

export default Ticket;
export { AnswerTicket };