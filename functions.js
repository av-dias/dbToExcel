const cloneDeep = require("lodash.clonedeep");

const populatePurchases = (usersStats, usersPurchase, user, maxUser, userTotal, userOwn, userShare) => {
  let typeByMonth = ["purchaseTypeByMonthRelative", "purchaseTypeByMonthMine", "purchaseTypeByMonthYour"];
  let targetValue = ["value", "myShare", "youShare"];

  for (; user < maxUser; user++) {
    // Add details
    usersPurchase[user]["myShare"] = (usersPurchase[user].value * (100 - usersPurchase[user].weight)) / 100;
    usersPurchase[user]["youShare"] = (usersPurchase[user].value * usersPurchase[user].weight) / 100;
    // Accumulate purchase values
    userTotal[user] += usersPurchase[user].value;
    userOwn[user] += usersPurchase[user]["myShare"];
    userShare[user] += usersPurchase[user]["youShare"];

    for (let _type = 0; _type < typeByMonth.length; _type++) {
      // Get purchase by type and month
      let date = new Date(usersPurchase[user].dop).getMonth() + 1;
      if (!usersStats[user][typeByMonth[_type]].hasOwnProperty(usersPurchase[user].type)) {
        usersStats[user][typeByMonth[_type]][usersPurchase[user].type] = new Map([[date, 0]]);
      }

      let currentValue = usersStats[user][typeByMonth[_type]][usersPurchase[user].type].get(date);
      if (isNaN(currentValue)) {
        currentValue = 0;
      }

      usersStats[user][typeByMonth[_type]][usersPurchase[user].type].set(
        date,
        (parseFloat(currentValue) + parseFloat(usersPurchase[user][targetValue[_type]])).toFixed(2)
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
const formatAndCal = (resUsers, resUser1, resUser2, resTransactions) => {
  let appendedList = [];
  let userTotal = [0, 0];
  let userOwn = [0, 0];
  let userShare = [0, 0];
  let usersStats = [
    {
      purchaseTypeByMonthRelative: {}, // What left my wallet
      purchaseTypeByMonthMine: {}, // What should have left my wallet  (how much I spent on supermarket)
      purchaseTypeByMonthYour: {}, // What I paid for someone          (how much I payed her for supermarket)
      purchaseTypeByMonthReal: {}, // What should have left my wallet in reality (how much I spent + she payed for me on supermarket - couple expenses)
      purchaseTypeByMonthCouple: {}, // What really left from both combined (how much we both spent on supermarket)
      avg_purchase_by_month_relative: {},
      avg_purchase_by_month_mine: {},
      avg_purchase_by_month_your: {},
      avg_purchase_by_month_real: {},
      avg_purchase_by_month_couple: {},
    },
    {
      purchaseTypeByMonthRelative: {},
      purchaseTypeByMonthMine: {},
      purchaseTypeByMonthYour: {},
      purchaseTypeByMonthReal: {},
      purchaseTypeByMonthCouple: {},
      avg_purchase_by_month_relative: {},
      avg_purchase_by_month_mine: {},
      avg_purchase_by_month_your: {},
      avg_purchase_by_month_real: {},
      avg_purchase_by_month_couple: {},
    },
  ];

  while (resUser1.length && resUser2.length) {
    let usersPurchase = [resUser1.pop(), resUser2.pop()];
    let user = 0,
      maxUser = 2;

    [usersPurchase, userTotal, userOwn, userShare] = populatePurchases(usersStats, usersPurchase, user, maxUser, userTotal, userOwn, userShare);
    usersPurchase = renameKeys(usersPurchase, 0);
    usersPurchase = renameKeys(usersPurchase, 1);

    let append = Object.assign(usersPurchase[0], usersPurchase[1]);
    appendedList.push(append);
  }

  while (resUser1.length) {
    let usersPurchase = [resUser1.pop(), 0];
    let user = 0,
      maxUser = 1;
    [usersPurchase, userTotal, userOwn, userShare] = populatePurchases(usersStats, usersPurchase, user, maxUser, userTotal, userOwn, userShare);

    usersPurchase = renameKeys(usersPurchase, 0);
    appendedList.push(usersPurchase[0]);
  }

  while (resUser2.length) {
    let usersPurchase = [0, resUser2.pop()];
    let user = 1,
      maxUser = 2;
    [usersPurchase, userTotal, userOwn, userShare] = populatePurchases(usersStats, usersPurchase, user, maxUser, userTotal, userOwn, userShare);

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

  [appendedList, rowNr] = transAdjust(appendedList, resTransactions, rowNr, resUsers);

  if (userShare[0] - appendedList[rowNr - 4]["calcs"] >= userShare[1] - appendedList[rowNr - 2]["calcs"]) {
    appendedList[rowNr]["name"] = resUsers[1].name;
    appendedList[rowNr++]["calcs"] = "Dept";

    appendedList[rowNr]["name"] = "Value";
    appendedList[rowNr++]["calcs"] = userShare[0] - appendedList[rowNr - 4]["calcs"] - userShare[1];
  } else {
    appendedList[rowNr]["name"] = resUsers[0].name;
    appendedList[rowNr++]["calcs"] = "Dept";

    appendedList[rowNr]["name"] = "Value";
    appendedList[rowNr++]["calcs"] = userShare[1] - appendedList[rowNr - 2]["calcs"] - userShare[0];
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

/*    purchaseTypeByMonthRelative: {},    // What left my wallet
      purchaseTypeByMonthMine: {},        // What should have left my wallet
      purchaseTypeByMonthYour: {},        // What I paid for someone
      purchaseTypeByMonthReal: {},        // What should have left my wallet in reality (couple expenses)
      purchaseTypeByMonthCouple: {},      // What left from both wallets combined
      avg_purchase_by_month_relative: {},
      avg_purchase_by_month_mine: {},
      avg_purchase_by_month_your: {},
      avg_purchase_by_month_real: {},
      avg_purchase_by_month_couple: {},   */
const statsCalcs = (usersStats) => {
  let calcsIO = {
    purchaseTypeByMonthRelative: "avg_purchase_by_month_relative",
    purchaseTypeByMonthMine: "avg_purchase_by_month_mine",
    purchaseTypeByMonthYour: "avg_purchase_by_month_your",
    purchaseTypeByMonthReal: "avg_purchase_by_month_real",
    purchaseTypeByMonthCouple: "avg_purchase_by_month_couple",
  };

  calcPurchaseReal(usersStats);
  calPurchaseCouple(usersStats);

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

// Get purchases by type by month for Real wallet spent
const calcPurchaseReal = (usersStats) => {
  let otherUser = 1;
  for (let i = 0; i < 2; i++) {
    usersStats[i]["purchaseTypeByMonthReal"] = cloneDeep(usersStats[i]["purchaseTypeByMonthMine"]);
    Object.keys(usersStats[otherUser]["purchaseTypeByMonthYour"]).forEach((_type) => {
      usersStats[otherUser]["purchaseTypeByMonthYour"][_type].forEach((v, k) => {
        if (!usersStats[i]["purchaseTypeByMonthReal"].hasOwnProperty(_type)) {
          usersStats[i]["purchaseTypeByMonthReal"][_type] = new Map();
        }
        let currentValue = usersStats[i]["purchaseTypeByMonthReal"][_type].get(k);
        if (isNaN(currentValue)) {
          currentValue = 0;
        }
        usersStats[i]["purchaseTypeByMonthReal"][_type].set(k, (parseFloat(currentValue) + parseFloat(v)).toFixed(2));
      });
    });
    otherUser = 0;
  }
};

// Get purchases by type by month for Couple wallet spent
const calPurchaseCouple = (usersStats) => {
  usersStats[0]["purchaseTypeByMonthCouple"] = cloneDeep(usersStats[0]["purchaseTypeByMonthRelative"]);
  Object.keys(usersStats[1]["purchaseTypeByMonthRelative"]).forEach((_type) => {
    usersStats[1]["purchaseTypeByMonthRelative"][_type].forEach((v, k) => {
      if (!usersStats[0]["purchaseTypeByMonthCouple"].hasOwnProperty(_type)) {
        usersStats[0]["purchaseTypeByMonthCouple"][_type] = new Map();
      }
      let currentValue = usersStats[0]["purchaseTypeByMonthCouple"][_type].get(k);
      if (isNaN(currentValue)) {
        currentValue = 0;
      }
      usersStats[0]["purchaseTypeByMonthCouple"][_type].set(k, (parseFloat(currentValue) + parseFloat(v)).toFixed(2));
    });
  });
  usersStats[1]["purchaseTypeByMonthCouple"] = cloneDeep(usersStats[0]["purchaseTypeByMonthCouple"]);
};

const insertRows = (usersStats, appendedList, users) => {
  let rowCount = 0;

  appendedList[rowCount]["user1purchase"] = users[0].name;
  appendedList[rowCount]["user2purchase"] = users[1].name;

  for (let i = 0; i < usersStats.length; i++) {
    let rowCount = 0;

    Object.keys(usersStats[i]).forEach((_purchaseType) => {
      if (appendedList[rowCount] == undefined) {
        appendedList.push({});
      }
      appendedList[rowCount]["name" + (i + 1) + "purchase"] = _purchaseType;
      Object.keys(usersStats[i][_purchaseType]).forEach((_type) => {
        if (appendedList[rowCount] == undefined) {
          appendedList.push({});
        }
        appendedList[rowCount]["type" + (i + 1) + "purchase"] = _type;
        if (usersStats[i][_purchaseType][_type] instanceof Map) {
          usersStats[i][_purchaseType][_type].forEach((v, k) => {
            if (appendedList[rowCount] == undefined) {
              appendedList.push({});
            }
            appendedList[rowCount]["month" + (i + 1)] = k;
            appendedList[rowCount++]["value" + (i + 1) + "purchase"] = v;
          });
        } else {
          if (appendedList[rowCount] == "undefined") {
            appendedList.push({});
          }
          appendedList[rowCount++]["value" + (i + 1) + "purchase"] = usersStats[i][_purchaseType][_type];
        }
      });
    });
  }
  return appendedList;
};

module.exports = { formatAndCal, transAdjust, statsCalcs, insertRows };
