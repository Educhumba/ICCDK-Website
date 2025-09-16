const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Message = sequelize.define("Message", {
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false },
  subject: { type: DataTypes.STRING(200) },
  message: { type: DataTypes.TEXT },
  date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM("new", "reviewed", "archived"), defaultValue: "new" }
}, {
  tableName: "messages",
  timestamps: false
});

module.exports = Message;