const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Highlights = sequelize.define("Highlights", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  batchId: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  eventName: { 
    type: DataTypes.STRING(200), 
    allowNull: false 
  },
  eventLink: { 
    type: DataTypes.STRING(500), 
    allowNull: false 
  },
  title: { 
    type: DataTypes.STRING(200), 
    allowNull: false 
  },
  image: { 
    type: DataTypes.STRING(255), 
    allowNull: false 
  },
  uploaded_at: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
}, {
  tableName: "highlights",
  timestamps: false
});

module.exports = Highlights;
