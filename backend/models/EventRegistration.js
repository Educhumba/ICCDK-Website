const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Event = require("./Event");
const Members = require("./members");

const EventRegistration = sequelize.define(
  "EventRegistration",
  {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attendees: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "events",
        key: "id",
      },
    },
    userId: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "members", 
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    status: {
      type: DataTypes.ENUM("registered", "absent", "cancelled"),
      defaultValue: "registered",
    },
  },
  {
    tableName: "event_registrations",
    timestamps: true,
  }
);

// Associations
EventRegistration.belongsTo(Event, { foreignKey: "eventId", as: "event" });
Event.hasMany(EventRegistration, { foreignKey: "eventId", as: "registrations" });

EventRegistration.belongsTo(Members, { foreignKey: "userId", as: "user" }); // new
Members.hasMany(EventRegistration, { foreignKey: "userId", as: "registrations" }); // new

module.exports = EventRegistration;
