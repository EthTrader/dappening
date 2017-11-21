const modDayRate = require("../out/modDayRate.json");
const collectedTill = require("../out/collectedTill.json");

function calcEndowment(user){
    // const postScores = [user.ethereumPosts, user.ethtraderPosts, user.ethdevPosts, user.etherminingPosts];
    // const commentScores = [user.ethereumComments, user.ethtraderComments, user.ethdevComments, user.etherminingComments];
    // const modStarts = [user.modStartDateEthereum || 0, user.modStartDateEthtrader || 0, user.modStartDateEtherdev || 0, user.modStartDateEthermining || 0];
    //
    // let endowment = 0;
    // for (let i = 0; i < postScores.length; i++) {
    //     endowment += postScores[i];
    // }
    // for (let j = 0; j < commentScores.length; j++) {
    //     endowment += commentScores[j];
    // }
    // let modStartMax = 0;
    // for (let k = 0; k < modStarts.length; k++) {
    //     if(modStarts[k] > 0 && (modStartMax === 0 || modStarts[k] < modStartMax)) {
    //         modStartMax = modStarts[k];
    //     }
    // }

    let endowment = user.score;

    // if(modStartMax > 0 && modStartMax < collectedTill) {
    //     endowment += (collectedTill - modStartMax) * modDayRate / (60*60*24);
    // }

    if(endowment < 0) endowment = 0;
    return endowment;
}

// let myTestData = ["carlslarson",1403190201,[216,1688,422,1055],[756,3056,611,1528],[0,1427241600,0,0]]
// console.log(calcEndowment(myTestData));

module.exports = calcEndowment;
