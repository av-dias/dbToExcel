const ExcelJS = require("exceljs");
const dotenv = require("dotenv");
dotenv.config();

const colsSchema = require("./excelSchema");
const currentDatetime = require("./util");
const { formatAndCal } = require("./functions");
const { getPurchase } = require("./queries");

const runDBtoExcel = async () => {
  // Create new excel instance
  const workbook = new ExcelJS.Workbook();
  // Load existing workbook
  await workbook.xlsx.readFile("db.xlsx");

  // Add new sheet with current datetime
  const sheet = workbook.addWorksheet(currentDatetime());
  // Excel column schema
  sheet.columns = colsSchema;

  const res = await getPurchase();

  // append same rows from each user
  // make some stats calculations
  let appendedList = formatAndCal(res.users, res.user1, res.user2);

  sheet.addRow({ user1: res.users[0].name, user2: res.users[1].name });

  // write data row by row
  appendedList.forEach((item, i) => {
    sheet.addRow(item);
  });

  workbook.xlsx.writeFile("db.xlsx").then(() => {
    console.log("Finished...");
  });
};

runDBtoExcel();
