document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".trigger");

  buttons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      buttons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
    });
  });
});

// Form Validation-------------------
const tasktitle = document.getElementById("task-title");
const taskdate = document.getElementById("due-datet");

function validateForm() {
  let isValid = true;

  if (!tasktitle.value.trim()) {
    setError("task-title", "* This field is required");
    isValid = false;
  }

  if (!taskdate.value.trim()) {
    setError("due-datet", " * This field is required");
    isValid = false;
  }
  return isValid;
}

function setError(fieldId, message) {
  let input = document.getElementById(fieldId);
  let errorDiv = document.getElementById("error-" + fieldId);

  if (input) input.classList.add("input-error");
  if (errorDiv) errorDiv.innerText = message;
}

function clearErrors() {
  document.querySelectorAll(".error-msg").forEach((el) => {
    el.innerText = "";
  });

  document.querySelectorAll("input").forEach((input) => {
    input.classList.remove("input-error");
  });
}

// const date = moment('20120222', 'YYYYMMDD').fromNow();
