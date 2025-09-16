const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Pdf = sequelize.define("Pdf", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  file_path: { type: DataTypes.STRING(255), allowNull: false },   // server filename
  original_name: { type: DataTypes.STRING(255), allowNull: false }, // original filename
  uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "pdfs",
  timestamps: false
});

module.exports = Pdf;