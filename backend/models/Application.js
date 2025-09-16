const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Application = sequelize.define("Application", {
  name: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING(150), 
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  number: {
    type: DataTypes.STRING(20), 
    allowNull: false,
    validate: {
      is: /^\+?[0-9]{10,15}$/
    }
  },
  category: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  message: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },

  date_established: { 
    type: DataTypes.DATEONLY, 
    allowNull: true 
  },
  organization_size: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    validate: { min: 1 }
  },
  years_activity: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    validate: { min: 0 }
  },
  submission_date: { 
    type: DataTypes.DATEONLY, 
    allowNull: true 
  },

  date: { 
    type: DataTypes.DATEONLY, 
    defaultValue: DataTypes.NOW 
  },
  status: { 
    type: DataTypes.ENUM("new", "reviewed", "archived"), 
    defaultValue: "new" 
  },
}, {
  tableName: "applications",
  timestamps: true, // adds createdAt & updatedAt automatically
});

module.exports = Application;