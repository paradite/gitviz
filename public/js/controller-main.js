var circleChart = require('./controller-circle');
var donutChart = require('./controller-donut');
// var notificationDialog = require('./controller-notification-dialog');

function addNewRepo(input) {
  console.log(input.username);
  console.log(input.repo);
  circleChart.addNewUser(input);
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
dialog.querySelector('#add-email-btn').addEventListener('click', function () {
  // Get email id, i.e. last email id + 1. Note this is not the html id. Just a number
  var emails = dialog.querySelector('#emails');
  emailCount += 1;

  // Create new email
  var newEmail = createNewEmailInput(emailCount);

  // Remove disabled remove btn
  if (emails.querySelector('[disabled]')) {
    emails.querySelector('[disabled]').removeAttribute('disabled');
  }

  // Append and update
  emails.appendChild(newEmail);
  componentHandler.upgradeAllRegistered();
  newEmail.focus();
});

// Add remove event
document.querySelector(".remove-email-btn").addEventListener('click', removeEmailInput);

function removeEmailInput() {
  var emails = document.querySelector('#emails');
  emails.removeChild(this.parentNode.parentNode);
  
  // Disable remove button if there is only 1 left
  var btns = emails.querySelectorAll(".remove-email-btn");
  if (btns && btns.length == 1) {
    btns[0].setAttribute("disabled", "true");
  }

  componentHandler.upgradeAllRegistered();
}
function createNewEmailInput(id) {
  // Clone email template
  var email = document.getElementById("email-input-template").cloneNode(true);
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

  // Add event listener to the remove button
  email.querySelector(".remove-email-btn").addEventListener('click', removeEmailInput);
  return email;
}
// function createNewEmailInput(id) {
//   // Email grid wrapper
//   var email = document.createElement("div");
//   email.className = "mdl-grid";
//   email.id = "email-" + id;

//   // Input fields
//   var emailInput = document.createElement("div");
//   emailInput.className = "mdl-cell mdl-cell--10-col";

//   // Input group with input field and label
//   var inputGroup = document.createElement("div");
//   inputGroup.className = "mdl-textfield mdl-js-textfield mdl-textfield--floating-label";
  
//   var input = document.createElement("input");
//   input.className = "mdl-textfield__input";
//   input.type = "email";
//   input.autocomplete = "on";
//   input.id = "notification-input-" + id;

//   var label = document.createElement("label");
//   label.className = "mdl-textfield__label";
//   label.setAttribute("for", input.id);
//   label.innerHTML = "Email";

//   inputGroup.appendChild(label);
//   inputGroup.appendChild(input);
//   emailInput.appendChild(inputGroup);

//   // Remove button
//   var removeBtn = document.createElement("div");
//   removeBtn.className = "mdl-cell mdl-cell--2-col";
  
//   var button = document.createElement("button");
//   button.className = "mdl-button mdl-js-button mdl-button--icon mdl-button--colored";
//   var icon = document.createElement("i");
//   icon.className = "material-icons";
//   icon.innerHTML = "remove";
//   button.appendChild(icon);

//   removeBtn.appendChild(button);

//   // Append to parent element
//   email.appendChild(emailInput);
//   email.appendChild(removeBtn);

//   return email;
// }
