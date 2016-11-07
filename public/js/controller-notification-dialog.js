notifDialog = {};

// Modal dialog
notifDialog.emailCount = 0;
notifDialog.dialog = document.querySelector('dialog');
notifDialog.showModalButton = document.querySelector('.show-modal');
if (!notifDialog.dialog.showModal) {
  dialogPolyfill.registerDialog(notifDialog.dialog);
}
notifDialog.showModalButton.addEventListener('click', function () {
  notifDialog.dialog.showModal();
});
notifDialog.dialog.querySelector('.close').addEventListener('click', function () {
  notifDialog.dialog.close();
});

notifDialog.dialog.querySelector('#add-email-btn').addEventListener('click', addNewEmailInput);
notifDialog.dialog.querySelector('.email-input').addEventListener('keypress', onKeypressEmailInput);
notifDialog.dialog.querySelector('.remove-email-btn').addEventListener('click', removeEmailInput);
notifDialog.dialog.querySelector('#subscribe-btn').addEventListener('click', subscribeEmails);

function subscribeEmails() {
  // Get the valid subscribing emails
  var inputs = notifDialog.dialog.querySelectorAll(".mdl-textfield.is-dirty:not(.is-invalid)");
  var emails = [];
  for (var i = 0; i < inputs.length; i++) {
    emails.push(inputs[i].querySelector('.email-input').value);
  }

  console.log(emails);
  console.log(JSON.stringify(emails));

  // Make server call to update subscribing emails for current user.
  $.ajax({
    type: 'POST',
    data: JSON.stringify(emails),
    contentType: 'application/json',
    url: "/api/subscribe",
    success: function (data) {
      console.log("Done subscribing");
      notifDialog.dialog.close();
      notifDialog.showModalButton.innerHTML = 'Subscribed <i class="material-icons">done</i>'
    },
  });
}

/**
   * Disable the remove button if there is only 1 input field.
   */
function disableRemoveButton() {
  var emails = notifDialog.dialog.querySelector("#emails");
  var btns = emails.querySelectorAll(".remove-email-btn");

  if (!btns) 
    return; // Skip if there is nothing to do

  // Disable remove button if there is only 1 left
  if (btns.length == 1) {
    btns[0].setAttribute("disabled", "true");
  } else { // Otherwise, remove all disabled buttons
    btns.forEach(function (element) {
      element.removeAttribute('disabled');
    });
  }
}

function addNewEmailInput() {
  // Get email id, i.e. last email id + 1. Note this is not the html id. Just a number
  var emails = notifDialog.dialog.querySelector('#emails');
  notifDialog.emailCount += 1;

  // Create new email
  var newEmail = createNewEmailInput(notifDialog.emailCount);

  // Append and update
  emails.appendChild(newEmail);

  // Disable remove button if any
  disableRemoveButton();

  // Update and focus
  componentHandler.upgradeAllRegistered();
  newEmail.querySelector(".email-input").focus();
}

function removeEmailInput() {
  var emails = notifDialog.dialog.querySelector('#emails');
  emails.removeChild(this.parentNode.parentNode);

  // Disable the remove button
  disableRemoveButton();
  
  // Update and focus
  componentHandler.upgradeAllRegistered();
  emails.lastElementChild.querySelector(".email-input").focus();
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
    upgraded[i].className = upgraded[i].className.replace(/is-upgraded/g, '');
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

notifDialog.init = function (userName, repoName) {
  notifDialog.userName = userName;
  notifDialog.repoName = repoName;
  notifDialog.showModalButton.removeAttribute('hidden');
}

module.exports = notifDialog;