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


// Category Pflicht Feld -----------------
const subtaskInput = document.getElementById("subTaskInput");
const addBtn = document.getElementById("addSubtaskBtn");
const remvoeBtn = document.getElementById("removeSubtaskBtn");
const subtaskList = document.getElementById("subtaskList");

 addBtn.addEventListener("click", function (e) {
  e.preventDefault();
  const value = subtaskInput.value.trim();
  if (!value) return;

  const subtaskDiv = document.createElement("div");
  subtaskDiv.className = "subtask-item";

  subtaskDiv.innerHTML = `
    <input class="subtaskInputList" type="text" value="${value}" disabled>
    <div class="subtask-actions">
      <button type="button" class="edit-btn">
        ${editIcon()}
      </button>
        ${separatorIcon()}
      <button type="button" class="delete-btn">
        ${deleteIcon()}
      </button>
    </div>
  `;

  subtaskList.appendChild(subtaskDiv);
  subtaskInput.value = "";

  const input = subtaskDiv.querySelector("input");
  const editBtn = subtaskDiv.querySelector(".edit-btn");
  const deleteBtn = subtaskDiv.querySelector(".delete-btn");

  deleteBtn.onclick = () => subtaskDiv.remove();

  editBtn.onclick = () => {
    if (input.disabled) {
      input.disabled = false;
      input.focus();
      editBtn.innerHTML = confirmIcon();
    } else {
      input.disabled = true;
      editBtn.innerHTML = editIcon();
    }
  };
});

remvoeBtn.addEventListener("click", () => {
  subtaskInput.value = "";
});

function editIcon() {
  return `
    <svg class="subtask-icons" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><mask id="a" width="24" height="24" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#2a3647" d="M0 0h24v24H0z"/></mask><g mask="url(#a)"><path fill="#2a3647" d="M5 19h1.4l8.625-8.625-1.4-1.4L5 17.6zM19.3 8.925l-4.25-4.2 1.4-1.4a1.92 1.92 0 0 1 1.413-.575q.837 0 1.412.575l1.4 1.4q.574.575.6 1.388a1.8 1.8 0 0 1-.55 1.387zM17.85 10.4 7.25 21H3v-4.25l10.6-10.6z"/></g></svg>
  `;
}

function deleteIcon() {
  return `
    <svg class="subtask-icons" xmlns="http://www.w3.org/2000/svg" width="16" height="17" fill="none" viewBox="0 0 17 18"><path fill="#2a3647" d="M3.145 18q-.825 0-1.413-.587A1.93 1.93 0 0 1 1.145 16V3a.97.97 0 0 1-.713-.288A.97.97 0 0 1 .145 2q0-.424.287-.712A.97.97 0 0 1 1.145 1h4q0-.424.287-.712A.97.97 0 0 1 6.145 0h4q.424 0 .712.288.288.287.288.712h4q.424 0 .712.288.288.287.288.712 0 .424-.288.712a.97.97 0 0 1-.712.288v13q0 .824-.588 1.413a1.93 1.93 0 0 1-1.412.587zm0-15v13h10V3zm2 10q0 .424.287.713.288.287.713.287.424 0 .712-.287A.97.97 0 0 0 7.145 13V6a.97.97 0 0 0-.288-.713A.97.97 0 0 0 6.145 5a.97.97 0 0 0-.713.287.97.97 0 0 0-.287.713zm4 0q0 .424.287.713.288.287.713.287.424 0 .712-.287a.97.97 0 0 0 .288-.713V6a.97.97 0 0 0-.288-.713.97.97 0 0 0-.712-.287.97.97 0 0 0-.713.287.97.97 0 0 0-.287.713z"/></svg>
  `;
}

function confirmIcon() {
  return `
    <svg class="subtask-icons" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><mask id="a" width="24" height="24" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#d9d9d9" d="M0 0h24v24H0z"/></mask><g mask="url(#a)"><path fill="#2a3647" d="m9.55 15.15 8.476-8.475q.3-.3.712-.3.413 0 .713.3t.3.713q0 .411-.3.712l-9.2 9.2q-.3.3-.7.3a.96.96 0 0 1-.7-.3L4.55 13a.93.93 0 0 1-.288-.713 1.02 1.02 0 0 1 .313-.712q.3-.3.712-.3.413 0 .713.3z"/></g></svg>
  `;
}

function separatorIcon() {
  return `
    <div class="separator-icons">
      <svg width="3" height="24" viewBox="0 0 3 62" fill="none">
        <path stroke="#D1D1D1" stroke-linecap="round" stroke-width="3" d="M1.5 1.5v59"/>
      </svg>
    </div>
  `;
}





