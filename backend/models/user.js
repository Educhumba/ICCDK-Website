const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM(
      'super_admin',     // full control, can manage other admins
      'event_admin',     // manage events only
      'content_admin',   // manage news, PDFs, highlights
      'moderator'        // view feedback, applications and event = registrations
    ),
    defaultValue: 'moderator',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  verification_code: DataTypes.STRING,
  reset_code: DataTypes.STRING,
  reset_expires: DataTypes.DATE,
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  last_active: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  force_password_reset: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = User;
