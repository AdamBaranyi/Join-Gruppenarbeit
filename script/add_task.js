document.addEventListener("DOMContentLoaded", function () {
  initializePriorityButtons();
  initializeFormValidation();
  initializeAssignedDropdown();
  initializeCategoryDropdown(); 
  initializeSubtasks();
});

function initializePriorityButtons() {
  const triggers = document.querySelectorAll(".trigger");

  triggers.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      triggers.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

function initializeFormValidation() {
  const form = document.getElementById("taskForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (validateForm()) {
      document.getElementById("successOverlay").style.display = "flex";

      setTimeout(() => {
        window.location.href = "../html/board.html";
      }, 1200);
    }
  });
}

function validateForm() {
  clearErrors();
  let isValid = true;

  const tasktitle = document.getElementById("task-title");
  const taskdate = document.getElementById("due-date");
  const categoryDropdown = document.querySelector(
    ".category-dropdown .placeholder",
  );

  if (!tasktitle.value.trim()) {
    setError("task-title", "* This field is required");
    isValid = false;
  }

  if (!taskdate.value) {
    setError("due-date", "* This field is required");
    isValid = false;
  }

  if (categoryDropdown.textContent === "Select task category") {
    setError("categoryDropdown", "* This field is required");
    document.getElementById("categoryDropdown").classList.add("input-error");
    isValid = false;
  }

  return isValid;
}

function setError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorDiv = document.getElementById("error-" + fieldId);

  if (input) input.classList.add("input-error");
  if (errorDiv) errorDiv.innerText = message;
}

function clearErrors() {
  document.querySelectorAll(".error-msg").forEach((el) => {
    el.innerText = "";
  });

  document.querySelectorAll(".input-error").forEach((el) => {
    el.classList.remove("input-error");
  });
}

function initializeAssignedDropdown() {
  const dropdown = document.getElementById("assignedDropdown");
  if (!dropdown) return;

  const header = dropdown.querySelector(".dropdown-header");
  const dropdownList = document.getElementById("dropdownList");
  const selectedUsersContainer = document.getElementById("selectedUsers");
  const placeholder = dropdown.querySelector(".placeholder");

  let selectedContacts = [];

  const contacts = [
    "Sofiia Müller (You)",
    "Anton Mayer",
    "Anja Schulz",
    "Benedikt Ziegler",
    "David Eisenberg",
  ];

  function getInitials(name) {
    const cleanName = name.replace(" (You)", "");
    return cleanName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }

  function renderContacts() {
    dropdownList.innerHTML = "";

    contacts.forEach((name) => {
      const initials = getInitials(name);
      const isYou = name.includes("(You)");

      const item = document.createElement("div");
      item.className = "contact-item";

      item.innerHTML = `
                <div class="contact-left">
                    <div class="contact-circle">${initials}</div>
                    <span>${name}</span>
                </div>
                <input type="checkbox" value="${name}" ${isYou ? "checked" : ""}>
            `;

      const checkbox = item.querySelector("input");
      if (isYou) {
        selectedContacts.push(name);
      }

      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          if (!selectedContacts.includes(name)) {
            selectedContacts.push(name);
          }
        } else {
          selectedContacts = selectedContacts.filter((c) => c !== name);
        }
        updateSelectedUsers();
      });

      dropdownList.appendChild(item);
    });

    updateSelectedUsers();
  }

  function updateSelectedUsers() {
    selectedUsersContainer.innerHTML = "";

    selectedContacts.slice(0, 4).forEach((name) => {
      const initials = getInitials(name);

      const circle = document.createElement("div");
      circle.className = "user-circle";
      circle.innerText = initials;
      circle.title = name;

      selectedUsersContainer.appendChild(circle);
    });

    placeholder.style.display =
      selectedContacts.length === 0 ? "inline" : "none";
  }

  renderContacts();

  header.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });
}

function initializeCategoryDropdown() {
  const dropdown = document.querySelector(".category-dropdown");
  if (!dropdown) return;

  const header = dropdown.querySelector(".dropdown-header");
  const placeholder = dropdown.querySelector(".placeholder");
  const dropdownList = dropdown.querySelector(".dropdown-list");
  const categoryItems = dropdownList.querySelectorAll(".category-item");

  header.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  categoryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const value = item.textContent;
      placeholder.textContent = value;
      placeholder.style.color = "#000";
      dropdown.classList.remove("open");

      dropdown.classList.remove("input-error");
      document.getElementById("error-categoryDropdown").innerText = "";
    });
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });
}

function initializeSubtasks() {
  const subtaskInput = document.getElementById("subTaskInput");
  const addBtn = document.getElementById("addSubtaskBtn");
  const clearBtn = document.getElementById("clearSubtaskBtn");
  const subtaskList = document.getElementById("subtaskList");

  addBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const value = subtaskInput.value.trim();
    if (!value) return;

    addSubtaskItem(value);
    subtaskInput.value = "";
  });

  clearBtn.addEventListener("click", function (e) {
    e.preventDefault();
    subtaskInput.value = "";
  });

  subtaskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addBtn.click();
    }
  });

  subtaskList.addEventListener("click", function (e) {
    const item = e.target.closest(".subtask-item");
    if (!item) return;

    const deleteBtn = e.target.closest(".delete-btn");
    if (deleteBtn) {
      item.remove();
      return;
    }

    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
      const input = item.querySelector("input");

      input.disabled = !input.disabled;
      editBtn.classList.toggle("editing");

      if (!input.disabled) input.focus();
    }
  });
}

function addSubtaskItem(value) {
  const subtaskList = document.getElementById("subtaskList");

  const subtaskItem = document.createElement("div");
  subtaskItem.className = "subtask-item";

  subtaskItem.innerHTML = `
        <input type="text" value="${value}" disabled>

        <div class="subtask-actions">
            <button type="button" class="edit-btn">

                <!-- Edit Icon -->
                  <svg class="edit-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><mask id="a" width="24" height="24" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#2a3647" d="M0 0h24v24H0z"/></mask><g mask="url(#a)"><path fill="#2a3647" d="M5 19h1.4l8.625-8.625-1.4-1.4L5 17.6zM19.3 8.925l-4.25-4.2 1.4-1.4a1.92 1.92 0 0 1 1.413-.575q.837 0 1.412.575l1.4 1.4q.574.575.6 1.388a1.8 1.8 0 0 1-.55 1.387zM17.85 10.4 7.25 21H3v-4.25l10.6-10.6z"/></g></svg>

                <!-- Save Icon -->
               <svg class="save-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><mask id="a" width="24" height="24" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#d9d9d9" d="M0 0h24v24H0z"/></mask><g mask="url(#a)"><path fill="#2a3647" d="m9.55 15.15 8.476-8.475q.3-.3.712-.3.413 0 .713.3t.3.713q0 .411-.3.712l-9.2 9.2q-.3.3-.7.3a.96.96 0 0 1-.7-.3L4.55 13a.93.93 0 0 1-.288-.713 1.02 1.02 0 0 1 .313-.712q.3-.3.712-.3.413 0 .713.3z"/></g></svg>

            </button>

            <span class="divider"></span>

            <button type="button" class="delete-btn">
                <svg class="subtask-icons" xmlns="http://www.w3.org/2000/svg" width="16" height="17" fill="none" viewBox="0 0 17 18"><path fill="#2a3647" d="M3.145 18q-.825 0-1.413-.587A1.93 1.93 0 0 1 1.145 16V3a.97.97 0 0 1-.713-.288A.97.97 0 0 1 .145 2q0-.424.287-.712A.97.97 0 0 1 1.145 1h4q0-.424.287-.712A.97.97 0 0 1 6.145 0h4q.424 0 .712.288.288.287.288.712h4q.424 0 .712.288.288.287.288.712 0 .424-.288.712a.97.97 0 0 1-.712.288v13q0 .824-.588 1.413a1.93 1.93 0 0 1-1.412.587zm0-15v13h10V3zm2 10q0 .424.287.713.288.287.713.287.424 0 .712-.287A.97.97 0 0 0 7.145 13V6a.97.97 0 0 0-.288-.713A.97.97 0 0 0 6.145 5a.97.97 0 0 0-.713.287.97.97 0 0 0-.287.713zm4 0q0 .424.287.713.288.287.713.287.424 0 .712-.287a.97.97 0 0 0 .288-.713V6a.97.97 0 0 0-.288-.713.97.97 0 0 0-.712-.287.97.97 0 0 0-.713.287.97.97 0 0 0-.287.713z"/></svg>
            </button>
        </div>
    `;

  subtaskList.appendChild(subtaskItem);
}

function clearForm() {
  document.getElementById("taskForm").reset();
  clearErrors();

  document.getElementById("selectedUsers").innerHTML = "";
  document.querySelector("#assignedDropdown .placeholder").style.display =
    "inline";

  const categoryPlaceholder = document.querySelector(
    ".category-dropdown .placeholder",
  );
  if (categoryPlaceholder) {
    categoryPlaceholder.textContent = "Select task category";
    categoryPlaceholder.style.color = "#666";
  }

  document.getElementById("subtaskList").innerHTML = "";

  document
    .querySelectorAll('#dropdownList input[type="checkbox"]')
    .forEach((cb) => {
      cb.checked = false;
    });
}

function clearCompleteForm() {
  clearForm();
  document.getElementById("subTaskInput").value = "";
}
