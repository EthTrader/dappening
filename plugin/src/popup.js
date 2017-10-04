// function flair(e) {
//   chrome.tabs.executeScript(null, {file: "dappening.js"});
//   window.close();
// }

document.addEventListener('DOMContentLoaded', function () {
  // var actions = document.querySelectorAll('.action');
  // for (var i = 0; i < actions.length; i++) {
  //   actions[i].addEventListener('click', flair);
  // }
  chrome.tabs.executeScript(null, {file: "dappening.js"});
});
