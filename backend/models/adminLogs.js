const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");

const AdminLog = sequelize.define("AdminLog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  action: {
    type: DataTypes.STRING, // e.g., "create_event", "update_news", "delete_pdf"
    allowNull: false,
  },
  entity_type: {
    type: DataTypes.STRING, // e.g., "Event", "News", "PDF"
    allowNull: false,
  },
  entity_id: {
    type: DataTypes.INTEGER, // ID of the record affected (if applicable)
    allowNull: true,
  },
  details: {
    type: DataTypes.TEXT, // more info about the action
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING, // log the IP of admin
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.STRING, // log the browser/device
    allowNull: true,
  },
}, {
  timestamps: true, // created_at, updated_at
  underscored: true,
});

AdminLog.belongsTo(User, { foreignKey: "admin_id" });

module.exports = AdminLog;
