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
 const categoryDropDwon = document.getElementById("categoryDropdown");

function validateForm() {
  clearError();
  let isValid = true;

  if (!tasktitle.value.trim()) {
    setError("task-title", "* This field is required");
    isValid = false;
  }
  if (!taskdate.value) {
    setError("due-date", "* This field is required");
    isValid = false;
  }
  if (!categoryDropDwon.value) {
    setError("categoryDropdown", "* This field is required");
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

function clearError() {
  document.querySelectorAll(".error-msg").forEach(el => {
    el.innerText = "";
  });

  document.querySelectorAll("select").forEach(select => {
    select.classList.remove("select-error");
  });
}

//  Dynamisch Contacts einfügen:------------------------------------ !
let contacts = ["Max Mustermann", "Anna Müller"];

function renderContacts(){
    const select = document.getElementById("assignedDropdown");

    select.innerHTML = `
    <option value="" disabled selected hidden> Select contact to assig</option>`;  
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

// Category Pflicht Feld -----------------
const subtaskInput = document.getElementById("subTaskInput");
const addBtn = document.getElementById("addSubtaskBtn");
const remvoeBtn = document.getElementById("removeSubtaskBtn");
const subtaskList = document.getElementById("subtaskList");

addBtn.addEventListener("click", e => {
  e.preventDefault();
  if (!subtaskInput.value.trim()) return;

  subtaskList.innerHTML += `
    <div class="subtask-item">
      <input class="subtaskInputList" type="text" 
        value="${subtaskInput.value.trim()}" disabled>
      <div class="subtask-actions">
        <button type="button" class="edit-btn">${editIcon()}</button>
        ${separatorIcon()}
        <button type="button" class="delete-btn">${deleteIcon()}</button>
      </div>
    </div>`;

  subtaskInput.value = "";
});

subtaskList.addEventListener("click", e => {
  const item = e.target.closest(".subtask-item");
  if (!item) return;

  if (e.target.closest(".delete-btn")) item.remove();

  if (e.target.closest(".edit-btn")) {
    const input = item.querySelector("input");
    input.disabled = !input.disabled;
    e.target.closest(".edit-btn").innerHTML =
      input.disabled ? editIcon() : confirmIcon();
    if (!input.disabled) input.focus();
  }
});

editIcon()
deleteIcon()
confirmIcon()
separatorIcon()
// ----------------------------Daran noch muss ich noch arbeiten!
const selects = document.querySelectorAll("select");

selects.forEach(select => {
  select.addEventListener("focus", () => {
    select.style.backgroundImage =
      "url('../assets/imgs/DropDown-up.svg')";
  });

  select.addEventListener("blur", () => {
    select.style.backgroundImage =
      "url('../assets/imgs/arrow_drop_downaa.svg')";
  });
});

document.querySelectorAll(".custom-dropdown").forEach(dropdown => {
  const header = dropdown.querySelector(".dropdown-header");

  header.addEventListener("click", () => {
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });
});

