const knex = require("../db/connection");
const tableName = "apiTable";

function read(email) {
  return knex(tableName).select("*").where({ email }).first();
}

function create(data) {
  return knex(tableName).insert(data).returning("*");
}

module.exports = {
  read,
  create,
};
