// config/index.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,

  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE
  },

  wechat: {
    appid: process.env.WECHAT_APPID,
    appsecret: process.env.WECHAT_APPSECRET
  },

  upload: {
    path: process.env.UPLOAD_PATH,
    maxSize: process.env.MAX_FILE_SIZE
  }
};