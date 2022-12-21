const db = require("./db");

const getPurchases = async () => {
  const users = await db.query("SELECT name FROM user_client");

  const resUser1 = await db.query(
    "SELECT purchase.name, purchase.type, purchase.value, purchase.dop, purchase.client_id, split.weight FROM purchase FULL JOIN split ON split.id = purchase.split_id WHERE client_id = 1"
  );

  const resUser2 = await db.query(
    "SELECT purchase.name, purchase.type, purchase.value, purchase.dop, purchase.client_id, split.weight FROM purchase FULL JOIN split ON split.id = purchase.split_id WHERE client_id = 2"
  );

  return {
    users: users.rows,
    user1: resUser1.rows,
    user2: resUser2.rows,
  };
};

const getTransactions = async () => {
  const resUser1 = await db.query(
    "SELECT * FROM transactions WHERE user_origin_id=2 AND user_destination_id=1"
  );

  const resUser2 = await db.query(
    "SELECT * FROM transactions WHERE user_origin_id=1 AND user_destination_id=2"
  );

  return { user1: resUser1.rows, user2: resUser2.rows };
};

const getPurchaseTypes = async () => {
  const purchasesTypes = await db.query(
    "SELECT DISTINCT purchase.type FROM purchase;"
  );

  return purchasesTypes.rows;
};

module.exports = { getPurchases, getTransactions, getPurchaseTypes };
