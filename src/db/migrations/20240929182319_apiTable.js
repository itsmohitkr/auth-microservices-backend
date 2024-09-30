exports.up = function (knex) {
  return knex.schema.createTable("apiTable", (table) => {
    table.increments("app_id").primary(); 
    table.string("name");
    table.string("app_name");
    table.string("email");
    table.string("api_key");
    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("apiTable");
};
