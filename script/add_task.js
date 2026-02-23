document.addEventListener("DOMContentLoaded", function () {
  const triggers = document.querySelectorAll(".trigger");
  triggers.forEach(btn => btn.addEventListener("click", e => {
    e.preventDefault();
    triggers.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    console.log("Selected Priority:", btn.dataset.priority);
  }));
});


// Form Validation-------------------
const tasktitle = document.getElementById("task-title");
const taskdate = document.getElementById("due-date");

function validateForm() {
  let isValid = true;

  if (!tasktitle.value.trim()) {
    setError("task-title", "* This field is required");
    isValid = false;
  }

  if (!taskdate.value.trim()) {
    setError("due-date", " * This field is required");
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

//  Dynamisch Contacts einfügen:------------------------------------ !
let contacts = ["Max Mustermann", "Anna Müller"];

function renderContacts(){
    const select = document.getElementById("assignedDropdown");

    select.innerHTML = `
    <option value="" disabled selected> Select contact to assig</option>
    `;  
    contacts.forEach(contact => {
        const option = document.createElement("option");
        option.value = contact;
        option.textContent = contact;
        select.appendChild(option);
    });
}

//  Wenn wir später neuen Kontakte erstellen wollen!
contacts.push("new contact");
renderContacts();




