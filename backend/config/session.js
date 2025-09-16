const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./db');

const sessionStore = new SequelizeStore({ db: sequelize });
sessionStore.sync();

module.exports = session({
  secret: process.env.SESSION_SECRET || "dev-secret",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true, // refresh expiry on activity
  cookie: {
    maxAge: 30 * 60 * 1000, // 30 minutes
    httpOnly: true,
    sameSite: "lax",
    secure: false
  }
});