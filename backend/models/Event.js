const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Event = sequelize.define("Event", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  title: { 
    type: DataTypes.STRING(200), 
    allowNull: false 
  },
  date: { 
    type: DataTypes.DATEONLY, 
    allowNull: false 
  },
  time: { 
    type: DataTypes.TIME, 
    allowNull: false 
  },
  location: { 
    type: DataTypes.STRING(255), 
    allowNull: false 
  },
  status: { 
    type: DataTypes.ENUM("past", "ongoing", "upcoming"), 
    defaultValue: "upcoming" 
  },
  created_at: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  updated_at: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
}, {
  tableName: "events",
  timestamps: false
});

module.exports = Event;
