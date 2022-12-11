const db = require("./db");

const getPurchase = async () => {
  const users = await db.query("SELECT name FROM user_client");

  const resUser1 = await db.query(
    "SELECT purchase.name AS name1, purchase.type AS type1, purchase.value AS value1, purchase.dop AS dop1, purchase.client_id AS client_id1, split.weight AS weight1 FROM purchase INNER JOIN split ON split.id = purchase.split_id WHERE client_id = 1 LIMIT 5"
  );

  const resUser2 = await db.query(
    "SELECT purchase.name AS name2, purchase.type AS type2, purchase.value AS value2, purchase.dop AS dop2, purchase.client_id AS client_id2, split.weight AS weight2 FROM purchase INNER JOIN split ON split.id = purchase.split_id WHERE client_id = 2 LIMIT 5"
  );

  return {
    users: users.rows,
    user1: resUser1.rows,
    user2: resUser2.rows,
  };
};

module.exports = { getPurchase };
