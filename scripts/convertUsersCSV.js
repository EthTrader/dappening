const fs = require('fs')
const csvFilePath=`${__dirname}/../out/users.csv`
console.log(csvFilePath)
const users = []
const csv=require('csvtojson')
csv()
.fromFile(csvFilePath)
.on('json',(user)=>{
  user.score = parseInt(user.score)
  user.firstContent = parseInt(user.firstcontent)
  delete user.firstcontent
  users.push(user)
    // combine csv header row and csv line to a json object
    // jsonObj.a ==> 1 or 4
})
.on('done',(error)=>{
    console.log('end')
    fs.writeFileSync(`${__dirname}/../data/users.json`, JSON.stringify(users, null, 4))
})
