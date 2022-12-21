const aux = (usersStats, usersPurchase, user, maxUser, userTotal, userOwn, userShare) => {
  let purchaseTypes = ["purchaseTypeByMonthRelative", "purchaseTypeByMonthMine"];
  let targetValue = ["value", "myShare"];

  for (; user < maxUser; user++) {
    // Add details
    usersPurchase[user]["myShare"] = (usersPurchase[user].value * (100 - usersPurchase[user].weight)) / 100;
    usersPurchase[user]["youShare"] = (usersPurchase[user].value * usersPurchase[user].weight) / 100;
    // Accumulate purchase values
    userTotal[user] += usersPurchase[user].value;
    userOwn[user] += usersPurchase[user]["myShare"];
    userShare[user] += usersPurchase[user]["youShare"];

    for (let types = 0; types < purchaseTypes.length; types++) {
      // Get purchase by type and month
      let date = new Date(usersPurchase[user].dop).getMonth() + 1;
      if (!usersStats[user][purchaseTypes[types]].hasOwnProperty(usersPurchase[user].type)) {
        usersStats[user][purchaseTypes[types]][usersPurchase[user].type] = new Map([[date, 0]]);
      }

      let currentValue = usersStats[user][purchaseTypes[types]][usersPurchase[user].type].get(date);
      if (isNaN(currentValue)) {
        currentValue = 0;
      }

      usersStats[user][purchaseTypes[types]][usersPurchase[user].type].set(
        date,
        (parseFloat(currentValue) + parseFloat(usersPurchase[user][targetValue[types]])).toFixed(2)
      );
    }
  }
  return [usersPurchase, userTotal, userOwn, userShare];
};

const renameKeys = (usersPurchase, i) => {
  let char = i + 1;
  usersPurchase[i]["name" + char] = usersPurchase[i].name;
  usersPurchase[i]["type" + char] = usersPurchase[i].type;
  usersPurchase[i]["value" + char] = usersPurchase[i].value;
  usersPurchase[i]["dop" + char] = usersPurchase[i].dop;
  usersPurchase[i]["client_id" + char] = usersPurchase[i].client_id;
  usersPurchase[i]["weight" + char] = usersPurchase[i].weight;
  usersPurchase[i]["myShare" + char] = usersPurchase[i].myShare;
  usersPurchase[i]["youShare" + char] = usersPurchase[i].youShare;

  delete usersPurchase[i]["name"];
  delete usersPurchase[i]["type"];
  delete usersPurchase[i]["value"];
  delete usersPurchase[i]["dop"];
  delete usersPurchase[i]["client_id"];
  delete usersPurchase[i]["weight"];
  delete usersPurchase[i]["myShare"];
  delete usersPurchase[i]["youShare"];

  return usersPurchase;
};

// Append data from same row
// Make stats calculations
const formatAndCal = (resUsers, resUser1, resUser2) => {
  let appendedList = [];
  let userTotal = [0, 0];
  let userOwn = [0, 0];
  let userShare = [0, 0];
  let usersStats = [
    {
      purchaseTypeByMonthRelative: {},
      purchaseTypeByMonthMine: {},
      avg_purchase_by_month_relative: {},
      avg_purchase_by_month_mine: {},
      avg_purchase_by_month_total: {},
    },
    {
      purchaseTypeByMonthRelative: {},
      purchaseTypeByMonthMine: {},
      avg_purchase_by_month_relative: {},
      avg_purchase_by_month_mine: {},
      avg_purchase_by_month_total: {},
    },
  ];

  while (resUser1.length && resUser2.length) {
    let usersPurchase = [resUser1.pop(), resUser2.pop()];
    let user = 0,
      maxUser = 2;

    [usersPurchase, userTotal, userOwn, userShare] = aux(usersStats, usersPurchase, user, maxUser, userTotal, userOwn, userShare);
    usersPurchase = renameKeys(usersPurchase, 0);
    usersPurchase = renameKeys(usersPurchase, 1);

    let append = Object.assign(usersPurchase[0], usersPurchase[1]);
    appendedList.push(append);
  }

  while (resUser1.length) {
    let usersPurchase = [resUser1.pop(), 0];
    let user = 0,
      maxUser = 1;
    [usersPurchase, userTotal, userOwn, userShare] = aux(usersStats, usersPurchase, user, maxUser, userTotal, userOwn, userShare);

    usersPurchase = renameKeys(usersPurchase, 0);
    appendedList.push(usersPurchase[0]);
  }

  while (resUser2.length) {
    let usersPurchase = [0, resUser2.pop()];
    let user = 1,
      maxUser = 2;
    [usersPurchase, userTotal, userOwn, userShare] = aux(usersStats, usersPurchase, user, maxUser, userTotal, userOwn, userShare);

    usersPurchase = renameKeys(usersPurchase, 1);
    appendedList.push(usersPurchase[1]);
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

  return [appendedList, rowNr, usersStats];
};

const transAdjust = (appendedList, resTransactions, rowNr, users) => {
  totalUser1 = 0;
  totalUser2 = 0;
  // check transations user1 received
  while (resTransactions.user1.length) {
    totalUser1 += resTransactions.user1.pop().amount;
  }
  //check transations user2 received
  while (resTransactions.user2.length) {
    totalUser2 += resTransactions.user2.pop().amount;
  }

  appendedList[rowNr]["name"] = "Transactions";
  appendedList[rowNr++]["calcs"] = "Received";

  appendedList[rowNr]["name"] = users[0].name;
  appendedList[rowNr++]["calcs"] = totalUser1;

  appendedList[rowNr]["name"] = users[1].name;
  appendedList[rowNr++]["calcs"] = totalUser2;

  return [appendedList, rowNr];
};

/*  purchaseTypeByMonthRelative,
    purchaseTypeByMonthMine,
    avg_purchase_by_month_relative,
    avg_purchase_by_month_mine,
    avg_purchase_by_month_total, */
const statsCalcs = (usersStats) => {
  let calcsIO = {
    purchaseTypeByMonthRelative: "avg_purchase_by_month_relative",
    purchaseTypeByMonthMine: "avg_purchase_by_month_mine",
  };

  Object.keys(calcsIO).forEach((input) => {
    for (let i = 0; i < usersStats.length; i++) {
      Object.keys(usersStats[i][input]).forEach((type) => {
        let arrayType = Array.from(usersStats[i][input][type].values());
        let size = arrayType.length;
        let total = arrayType.reduce((acc, curr) => {
          return parseFloat(acc) + parseFloat(curr);
        });

        usersStats[i][calcsIO[input]][type] = (total / size).toFixed(2);
      });
    }
  });

  return usersStats;
};

module.exports = { formatAndCal, transAdjust, statsCalcs };
