var json2csv = require('json2csv');
var fs = require("fs");
var userRegInputs = require("../out/userRegInputs");
var fieldNames = ['Username', 'Karma', 'First Content', 'Merkle Proof', 'Address'];

try {
  var result = json2csv({ data: userRegInputs, fieldNames: fieldNames });
  // console.log(result);
  fs.writeFileSync(`${__dirname}/../out/userRegInputs.csv`, result)
} catch (err) {
  // Errors are thrown for bad options, or if the data is empty and no fields are provided.
  // Be sure to provide fields if it is possible that your data array will be empty.
  console.error(err);
}
