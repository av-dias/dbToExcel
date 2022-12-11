module.exports = () => {
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

  return date_string;
};
