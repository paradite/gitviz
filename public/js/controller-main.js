var circleChart = require('./controller-circle');
var donutChart = require('./controller-donut');
// var notificationDialog = require('./controller-notification-dialog');

function addNewRepo(input) {
  var start = d3.select('#startdate').node().value;
  var end = d3.select('#enddate').node().value;
  var startDate = viz.util.parseDatePicker(start);
  var endDate = viz.util.parseDatePicker(end);
  if (startDate && endDate) {
    viz.data.setRangeRestriction(startDate, endDate);
  } else {
    viz.data.removeRangeRestriction();
  }

  console.log(input.username);
  console.log(input.repo);

  circleChart.addNewRepo(input.username, input.repo);
  donutChart.initContributionChart(input.username, input.repo);
}

function getUserRepoFromInput() {
  var newInput = {
    username: d3.select('#githubID-input').node().value,
    repo: d3.select('#repo-input').node().value,
    email: ''
  };
  if (newInput.email === '') {
    newInput.email = null;
  }
  if (newInput.username) {
    return newInput;
  } else {
    return null;
  }
}

var addButton = d3.select('#add-btn');

addButton.on('click', function() {
  addNewRepo(getUserRepoFromInput());
});

// Modal dialog
var emailCount = 0;
var dialog = document.querySelector('dialog');
var showModalButton = document.querySelector('.show-modal');
if (!dialog.showModal) {
  dialogPolyfill.registerDialog(dialog);
}
showModalButton.addEventListener('click', function () {
  dialog.showModal();
});
dialog.querySelector('.close').addEventListener('click', function () {
  dialog.close();
});

dialog.querySelector('#add-email-btn').addEventListener('click', addNewEmailInput);
dialog.querySelector(".email-input").addEventListener("keypress", onKeypressEmailInput);
dialog.querySelector(".remove-email-btn").addEventListener("click", removeEmailInput);

/**
 * Disable the remove button if there is only 1 input field.
 */
function disableRemoveButton() {
  var emails = dialog.querySelector("#emails");

  // Disable remove button if there is only 1 left
  var btns = emails.querySelectorAll(".remove-email-btn");
  if (btns && btns.length == 1) {
    btns[0].setAttribute("disabled", "true");
  } else { // Otherwise, remove all disabled buttons
    btns.forEach(function(element) {
      element.removeAttribute('disabled'); 
    });
  }
}

function addNewEmailInput() {
  // Get email id, i.e. last email id + 1. Note this is not the html id. Just a number
  var emails = dialog.querySelector('#emails');
  emailCount += 1;

  // Create new email
  var newEmail = createNewEmailInput(emailCount);

  // Disable remove button if any
  disableRemoveButton();

  // Append and update
  emails.appendChild(newEmail);
  componentHandler.upgradeAllRegistered();
  newEmail.querySelector(".email-input").focus();
}

function removeEmailInput() {
  var emails = dialog.querySelector('#emails');
  emails.removeChild(this.parentNode.parentNode);
  
  // Disable the remove button
  disableRemoveButton();
  componentHandler.upgradeAllRegistered();
}

function onKeypressEmailInput(e) {
  var key = e.which || e.keyCode;
  if (key == 13) { // 13 is Enter key
    addNewEmailInput();
  }
}

function createNewEmailInput(id) {
  // Clone email template
  var email = document.querySelector("#email-input-template").cloneNode(true);
  email.id = "email-" + id;
  email.removeAttribute("hidden");

  // Remove mdl attributes
  var upgraded = email.querySelectorAll(':not([data-upgraded=""])');
  for (var i = 0; i < upgraded.length; i++) {
    upgraded[i].setAttribute("data-upgraded", "");
    upgraded[i].className = upgraded[i].className.replace(/is-upgraded/g,'');
  }

  // Upgrade id for inner elements and return
  var inputId = "notification-input-" + id;
  email.querySelector(".mdl-textfield__input").id = inputId;
  email.querySelector(".mdl-textfield__label").setAttribute("for", inputId);

  // Add event listeners to the remove button and input field
  email.querySelector(".remove-email-btn").addEventListener('click', removeEmailInput);
  email.querySelector(".mdl-textfield__input").addEventListener('keypress', onKeypressEmailInput);
  return email;
}