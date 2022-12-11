// Append data from same row
// Make stats calculations
const formatAndCal = (resUser1, resUser2) => {
  let appendedList = [];

  while (resUser1.length && resUser2.length) {
    let rU1 = resUser1.pop();

    rU1["myShare1"] = (rU1.value1 * (100 - rU1.weight1)) / 100;
    rU1["youShare1"] = (rU1.value1 * rU1.weight1) / 100;

    let rU2 = resUser2.pop();
    rU2["myShare2"] = (rU2.value2 * (100 - rU2.weight2)) / 100;
    rU2["youShare2"] = (rU2.value2 * rU2.weight2) / 100;

    let append = Object.assign(rU1, rU2);
    appendedList.push(append);
  }

  while (resUser1.length) {
    let rU1 = resUser1.pop();

    rU1["myShare1"] = (rU1.value1 * (100 - rU1.weight1)) / 100;
    rU1["youShare1"] = (rU1.value1 * rU1.weight1) / 100;

    appendedList.push(rU1);
  }

  while (resUser2.length) {
    let rU2 = resUser2.pop();
    rU2["myShare2"] = (rU2.value2 * (100 - rU2.weight2)) / 100;
    rU2["youShare2"] = (rU2.value2 * rU2.weight2) / 100;

    appendedList.push(rU2);
  }

  return appendedList;
};

module.exports = { formatAndCal };
