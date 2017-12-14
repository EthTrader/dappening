const userRegInputs = require("../out/userRegInputs.json");
const fs = require("fs");

const addresses = userRegInputs.map(u=>u[4]);

console.log(addresses.length)

let count = Math.ceil(addresses.length / 100);

console.log(count)

let output = '';

for(let i=0;i<count;i++){
  fs.writeFileSync(`${__dirname}/../out/addresses/${i}.txt`, addresses.slice(i*100,i*100+100).join(","));
}
