const modDayRate = require("./out/modDayRate.json");

function calcEndowment(userData){
    const collectedTill = 1506816000;
    const [username, startDate, postScores, commentScores, modStarts] = userData;
    let endowment = 0;
    for (let i = 0; i < postScores.length; i++) {
        endowment += postScores[i];
    }
    for (let j = 0; j < commentScores.length; j++) {
        endowment += commentScores[j];
    }
    let modStartMax = 0;
    for (let k = 0; k < modStarts.length; k++) {
        if(modStarts[k] > 0 && (modStartMax === 0 || modStarts[k] < modStartMax)) {
            modStartMax = modStarts[k];
        }
    }
    if(modStartMax > 0 && modStartMax < collectedTill) {
        endowment += (collectedTill - modStartMax) * modDayRate / (60*60*24);
    }
    if(endowment < 0) endowment = 0;
    return endowment;
}

// let myTestData = ["carlslarson",1403190201,[216,1688,422,1055],[756,3056,611,1528],[0,1427241600,0,0]]
// console.log(calcEndowment(myTestData));

module.exports = calcEndowment;
