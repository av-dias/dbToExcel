const reader = require("xlsx");
const dotenv = require("dotenv");
dotenv.config();

const db = require("./db");

const dbtoExcel = async () => {
  try {
    const res = await db.query("SELECT * FROM purchase LIMIT 5");

    console.log(res.rows);
    // Reading our test file
    const file = reader.readFile("./db.xlsx");

    const ws = reader.utils.json_to_sheet(res.rows);

    let date = new Date();
    let date_string =
      date.getDate() +
      "_" +
      date.getMonth() +
      "_" +
      date.getFullYear() +
      "_" +
      date.getHours() +
      "" +
      date.getMinutes() +
      "" +
      date.getSeconds();

    console.log(date_string);

    reader.utils.book_append_sheet(file, ws, date_string);

    // Writing to our file
    await reader.writeFile(file, "./db.xlsx");
    console.log("Excel writen.");
  } catch (e) {
    console.log(e);
  }
};

dbtoExcel();
