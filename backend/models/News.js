const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const News = sequelize.define("News", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  author: { type: DataTypes.STRING(100), allowNull: true },
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  image: { type: DataTypes.STRING(255), allowNull: true }, // new column for image
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "news",
  timestamps: false
});

module.exports = News;
