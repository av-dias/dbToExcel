const ExcelJS = require("exceljs");
const dotenv = require("dotenv");
dotenv.config();

const colsSchema = require("./excelSchema");
const currentDatetime = require("./util");
const { formatAndCal, transAdjust, statsCalcs } = require("./functions");
const { getPurchases, getTransactions, getPurchaseTypes } = require("./queries");

const runDBtoExcel = async () => {
  // Create new excel instance
  const workbook = new ExcelJS.Workbook();
  // Load existing workbook
  await workbook.xlsx.readFile("db.xlsx");

  // Add new sheet with current datetime
  const sheet = workbook.addWorksheet(currentDatetime());
  // Excel column schema
  sheet.columns = colsSchema;

  // Query calls
  const resPurchases = await getPurchases();
  const resTransactions = await getTransactions();
  const purchasesTypes = await getPurchaseTypes();

  // append same rows from each user
  // make some stats calculations
  let [appendedList, rowNr, usersStats] = formatAndCal(resPurchases.users, resPurchases.user1, resPurchases.user2);

  usersStats = statsCalcs(usersStats);
  // Mid exit for testing purposes
  //return;

  // get transactions and adjust values
  [appendedList, rowNr] = transAdjust(appendedList, resTransactions, rowNr, resPurchases.users);

  sheet.addRow({
    user1: resPurchases.users[0].name,
    user2: resPurchases.users[1].name,
  });

  // write data row by row
  appendedList.forEach((item, i) => {
    sheet.addRow(item);
  });

  workbook.xlsx.writeFile("db.xlsx").then(() => {
    console.log("Finished...");
  });
};

runDBtoExcel();
