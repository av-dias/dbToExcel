// Append data from same row
// Make stats calculations
const formatAndCal = (resUsers, resUser1, resUser2, purchasesTypes) => {
  let appendedList = [];
  let userTotal = [0, 0];
  let userOwn = [0, 0];
  let userShare = [0, 0];
  let usersStats = [{ purchaseTypeByMonth: {} }, { purchaseTypeByMonth: {} }];

  while (resUser1.length && resUser2.length) {
    let rU1 = resUser1.pop();

    // Stats Calc
    rU1["myShare1"] = (rU1.value1 * (100 - rU1.weight1)) / 100;
    rU1["youShare1"] = (rU1.value1 * rU1.weight1) / 100;
    userTotal[0] += rU1.value1;
    userOwn[0] += rU1["myShare1"];
    userShare[0] += rU1["youShare1"];
    // Purchase Type Calcs
    if (usersStats[0]["purchaseTypeByMonth"][rU1.type1] == undefined)
      usersStats[0]["purchaseTypeByMonth"][rU1.type1] = new Map();

    let date = new Date(rU1.dop1).getMonth() + 1;
    let currentValue = usersStats[0]["purchaseTypeByMonth"][rU1.type1][date];
    console.log(currentValue);
    if (!currentValue) {
      usersStats[0]["purchaseTypeByMonth"][rU1.type1][date] = rU1.value1;
    } else {
      console.log(currentValue + rU1.value1);
      usersStats[0]["purchaseTypeByMonth"][rU1.type1][date] = (
        parseFloat(currentValue) + parseFloat(rU1.value1)
      ).toFixed(2);
    }

    // Stats Calc
    let rU2 = resUser2.pop();
    rU2["myShare2"] = (rU2.value2 * (100 - rU2.weight2)) / 100;
    rU2["youShare2"] = (rU2.value2 * rU2.weight2) / 100;
    userTotal[1] += rU2.value2;
    userOwn[1] += rU2["myShare2"];
    userShare[1] += rU2["youShare2"];

    let append = Object.assign(rU1, rU2);
    appendedList.push(append);
  }

  console.log(usersStats[0]);

  while (resUser1.length) {
    let rU1 = resUser1.pop();

    // Stats Calc
    rU1["myShare1"] = (rU1.value1 * (100 - rU1.weight1)) / 100;
    rU1["youShare1"] = (rU1.value1 * rU1.weight1) / 100;
    userTotal[0] += rU1.value1;
    userOwn[0] += rU1["myShare1"];
    userShare[0] += rU1["youShare1"];

    appendedList.push(rU1);
  }

  while (resUser2.length) {
    let rU2 = resUser2.pop();

    // Stats Calc
    rU2["myShare2"] = (rU2.value2 * (100 - rU2.weight2)) / 100;
    rU2["youShare2"] = (rU2.value2 * rU2.weight2) / 100;
    userTotal[1] += rU2.value2;
    userOwn[1] += rU2["myShare2"];
    userShare[1] += rU2["youShare2"];

    appendedList.push(rU2);
  }

  let rowNr = 1;

  for (let i = 0; i < 2; i++) {
    appendedList[rowNr]["name"] = resUsers[i].name;
    appendedList[rowNr++]["calcs"] = "";

    appendedList[rowNr]["name"] = "Share";
    appendedList[rowNr++]["calcs"] = userShare[i];

    appendedList[rowNr]["name"] = "Own";
    appendedList[rowNr++]["calcs"] = userOwn[i];

    appendedList[rowNr]["name"] = "Total";
    appendedList[rowNr++]["calcs"] = userTotal[i];
  }

  if (userShare[0] >= userShare[1]) {
    appendedList[rowNr]["name"] = resUsers[1].name;
    appendedList[rowNr++]["calcs"] = "Dept";

    appendedList[rowNr]["name"] = "Value";
    appendedList[rowNr++]["calcs"] = userShare[0] - userShare[1];
  } else {
    appendedList[rowNr]["name"] = resUsers[0].name;
    appendedList[rowNr++]["calcs"] = "Dept";

    appendedList[rowNr]["name"] = "Value";
    appendedList[rowNr++]["calcs"] = userShare[1] - userShare[0];
  }

  return [appendedList, rowNr];
};

const transAdjust = (appendedList, resTransactions, rowNr, users) => {
  totalUser1 = 0;
  totalUser2 = 0;
  console.log(resTransactions);
  // check transations user1 received
  while (resTransactions.user1.length) {
    totalUser1 += resTransactions.user1.pop().amount;
  }
  //check transations user2 received
  while (resTransactions.user2.length) {
    totalUser2 += resTransactions.user2.pop().amount;
  }

  console.log(totalUser1, totalUser2);

  appendedList[rowNr]["name"] = "Transactions";
  appendedList[rowNr++]["calcs"] = "Received";

  appendedList[rowNr]["name"] = users[0].name;
  appendedList[rowNr++]["calcs"] = totalUser1;

  appendedList[rowNr]["name"] = users[1].name;
  appendedList[rowNr++]["calcs"] = totalUser2;

  return [appendedList, rowNr];
};

module.exports = { formatAndCal, transAdjust };
