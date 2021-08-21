require('dotenv').config();

let PORT = process.env.PORT || 3003;
let MONGODB_URI = process.env.DB_CONN_STRING;
let MONGODB_URI_W_PWORD = process.env.DB_CONN_STRING_WITH_PWORD;

module.exports = {
  PORT,
  MONGODB_URI,
  MONGODB_URI_W_PWORD
};