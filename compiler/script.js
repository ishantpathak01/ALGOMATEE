const fs = require("fs");
let data = fs.readFileSync(0, "utf-8").split("\n");
data.forEach((line) => {
  let sum = line.split(" ").reduce((acc, num) => acc + parseInt(num), 0);
  console.log(sum);
});
