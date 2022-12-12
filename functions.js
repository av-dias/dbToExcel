// Append data from same row
// Make stats calculations
const formatAndCal = (resUsers, resUser1, resUser2) => {
  let appendedList = [];
  let userTotal = [0, 0];
  let userOwn = [0, 0];
  let userShare = [0, 0];

  while (resUser1.length && resUser2.length) {
    let rU1 = resUser1.pop();

    // Stats Calc
    rU1["myShare1"] = (rU1.value1 * (100 - rU1.weight1)) / 100;
    rU1["youShare1"] = (rU1.value1 * rU1.weight1) / 100;
    userTotal[0] += rU1.value1;
    userOwn[0] += rU1["myShare1"];
    userShare[0] += rU1["youShare1"];

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

  // GIVE BLANK ROW
  appendedList.unshift({
    name: "",
    calcs: "",
  });

  if (userShare[0] >= userShare[1]) {
    appendedList.unshift({
      name: "Value",
      calcs: userShare[0] - userShare[1],
    });
    appendedList.unshift({
      calcs: resUsers[1].name,
      name: "Dept",
    });
  } else {
    appendedList.unshift({
      name: "Value",
      calcs: userShare[1] - userShare[0],
    });
    appendedList.unshift({
      calcs: userShare[0].name,
      name: "Dept",
    });
  }

  for (let i = 0; i < 2; i++) {
    appendedList.unshift({
      name: "Share",
      calcs: userShare[i],
    });

    appendedList.unshift({
      name: "Own",
      calcs: userOwn[i],
    });

    appendedList.unshift({
      name: "Total",
      calcs: userTotal[i],
    });

    appendedList.unshift({
      name: resUsers[i].name,
      calcs: "",
    });
  }

  return appendedList;
};

module.exports = { formatAndCal };
