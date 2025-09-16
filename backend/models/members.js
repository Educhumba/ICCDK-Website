const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Members = sequelize.define(
  'Members',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true, // optional full name
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    verification_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reset_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_active: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true, // adds created_at, updated_at
    underscored: true,
  }
);

module.exports = Members;
