let currentUser;
let userId;
let url;
let leftSide = document.getElementById("left-side-modal");
const contactWindow = document.getElementById("contact-modal");
const contactModal = document.getElementById("dialog-modal");

//load current user from session storage
function getCurrentUser() {
  let currentUser = JSON.parse(sessionStorage.getItem("current_user"));
  return currentUser;
}

// sort contacts by firstname
function sortContactsByFirstname(contacts) {
  return [...contacts].sort((a, b) =>
    a.firstname.localeCompare(b.firstname, "de", { sensitivity: "base" }),
  );
}

// group contacts by the first letter of the firstname
function groupContactsByLetter(contacts) {
  const groups = {};

  contacts.forEach((contact) => {
    const letter = contact.firstname.charAt(0).toUpperCase();

    if (!groups[letter]) {
      groups[letter] = [];
    }
    groups[letter].push(contact);
  });

  return groups;
}

// load contacts of a user
async function loadContacts() {
  url = `${BASE_URL}/contacts/.json`;

  const response = await fetch(url);
  const data = await response.json();

  const contacts = [];
  if (data) {
    Object.keys(data).forEach((key) => {
      const contact = data[key];
      contact.id = key;
      contacts.push(contact);
    });
  }
  renderContactList(contacts);
}

// render contact list with currentuser contacts
function renderContactList(contacts) {
  const container = document.getElementById("contact-list-content");
  const sorted = sortContactsByFirstname(contacts);
  const groups = groupContactsByLetter(sorted);

  document
    .querySelectorAll(".contact-row")
    .forEach((row) => row.classList.remove("active"));
  container.innerHTML = "";
  Object.keys(groups)
    .sort()
    .forEach((letter) => {
      container.innerHTML += `
      <div class="letter-header">${letter}</div>
    `;
      groups[letter].forEach((contact) => {
        const initials =
          contact.firstname.charAt(0) + contact.lastname.charAt(0);
        const bgColor = getColorFromName(contact.firstname + contact.lastname);
        container.innerHTML += renderContactListItem(
          contact,
          initials,
          bgColor,
        );

      });
    });
}

const contactColors = [
  "#FF7A00",
  "#9327FF",
  "#6E52FF",
  "#FC71FF",
  "#FFBB2B",
  "#1FD7C1",
  "#462F8A",
  "#FF4646",
  "#00BEE8",
  "#FF745E",
];

function getColorFromName(name) {
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % contactColors.length;
  return contactColors[index];
}

// open the modal to create a new contact
function openModal() {
  const modalInitials = document.getElementById("modal-initials");
  modalInitials.style.backgroundColor = "transparent";
  modalInitials.classList.remove("contact-initials");
  modalInitials.classList.add("profile-img");
  modalInitials.classList.remove("contact-initials-edit");
  modalInitials.textContent = "";
  leftSide.innerHTML = openModalLeftSide();
  contactWindow.innerHTML = openModalRightSide();
  
  contactModal.showModal();
}

// close the modal
function closeModal() {
  contactModal.classList.add("slide-out");
  setTimeout(() => {
    contactModal.close();
    contactModal.classList.remove("slide-out");
  }, 380);
}

// Ensure ESC key triggers the smooth CSS close animation too
document.addEventListener("DOMContentLoaded", () => {
    const dialogModal = document.getElementById("dialog-modal");
    if (dialogModal) {
        dialogModal.addEventListener("cancel", (e) => {
            e.preventDefault();
            closeModal();
        });
    }
});

// add a new contact
async function addContact(contactData) {
  const res = await fetch(url);
  const contacts = await res.json();
  if (
    contactData.firstname !== "" &&
    contactData.lastname !== "" &&
    contactData.email !== ""
  ) {
    let nextIdNumber = 1;

    if (contacts) {
      const ids = Object.keys(contacts)
        .filter((id) => id.startsWith("c"))
        .map((id) => parseInt(id.substring(1)))
        .filter((num) => !isNaN(num));

      if (ids.length > 0) {
        nextIdNumber = Math.max(...ids) + 1;
      }
    }
    const newId = `c${nextIdNumber}`;
    const contactWithId = {
      id: newId,
      ...contactData,
    };
    await putContactInBackend(newId, contactWithId);
    await loadContacts();
    showSuccessMessage();
    closeModal();

    return newId;
  } else {
    markAsError();
  }
}

// save a new contact to the database
async function putContactInBackend(newId, contactWithId) {
  await fetch(`${BASE_URL}/contacts/${newId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactWithId),
  });
}

// show a success message after creating a new contact
function showSuccessMessage() {
  let successMessage = document.getElementById("success-message");
  successMessage.classList.remove("display-none");
  setTimeout(() => {
    successMessage.classList.add("show");
  }, 10);
  setTimeout(() => {
    successMessage.classList.add("display-none");
  }, 3000);
}

async function showContactDetails(contactId) {
  const response = await fetch(url);
  const data = await response.json();

  if (!data) return;

  const contact = data[contactId];
  renderContactCard(contact);
}

// render contact card with the details of a contact
function renderContactCard(contact) {
  const card = document.getElementById("contact-card-content");
  const sloganAndCardContainer = document.getElementById(
    "slogan-and-card-container",
  );
  const contactListContainer = document.getElementById(
    "contact-list-container",
  );
  const closeCardBtn = document.getElementById("close-card-btn");
  const mainContent = document.querySelector(".main-content");

  if (contactListContainer) contactListContainer.style.display = "";
  if (sloganAndCardContainer) sloganAndCardContainer.style.display = "";

  card.classList.remove("display-none");
  mainContent.classList.add("show-contact-card");
  card.innerHTML = contactCard(contact);
  showInitials(contact);
  
  const cardWrapper = document.getElementById("contact-card");
  cardWrapper.classList.remove("show");
  setTimeout(() => {
     cardWrapper.classList.add("show");
  }, 10);
  
  card.querySelector(".edit-btn").addEventListener("click", () => {
    renderEditForm(contact);
  });
  card.querySelector(".delete-btn").addEventListener("click", () => {
    deleteContact(contact.id);
  });
}

function showInitials(contact) {
    if (!contact) return;

    const cardInitials = document.getElementById("contact-initials");
    const modalInitials = document.getElementById("modal-initials");

    const fullName = contact.firstname + contact.lastname;
    const initials = contact.firstname.charAt(0) + contact.lastname.charAt(0);
    const color = getColorFromName(fullName);

    if (cardInitials) {
        cardInitials.style.backgroundColor = color;
        cardInitials.textContent = initials.toUpperCase();
    }

    if (modalInitials) {
        modalInitials.style.backgroundColor = color;
        modalInitials.textContent = initials.toUpperCase();
    }
}

// check for mobile render card
function checkForMobileRenderCard() {
  const card = document.getElementById("contact-card-content");
  const sloganAndCardContainer = document.getElementById(
    "slogan-and-card-container",
  );
  const contactListContainer = document.getElementById(
    "contact-list-container",
  );
  const closeCardBtn = document.getElementById("close-card-btn");
  const mobileSlogan = document.getElementById("mobile-slogan");

  if (window.innerWidth <= 850) {
    mobileSlogan.classList.remove("display-none");
    card.classList.remove("display-none");
    closeCardBtn.classList.remove("display-none");
    contactListContainer.style.display = "none";
    sloganAndCardContainer.style.display = "flex";
  } else {
    mobileSlogan.classList.add("display-none");
    card.classList.remove("display-none");
    closeCardBtn.classList.add("display-none");
    contactListContainer.style.display = "flex";
  }
}

// close the contact card on mobile devices
function closeContactCard() {
  const card = document.getElementById("contact-card-content");
  const mainContent = document.querySelector(".main-content");
  const contactListContainer = document.getElementById(
    "contact-list-container",
  );
  const sloganAndCardContainer = document.getElementById(
    "slogan-and-card-container",
  );

  card.innerHTML = "";
  mainContent.classList.remove("show-contact-card");

  if (contactListContainer) contactListContainer.style.display = "";
  if (sloganAndCardContainer) sloganAndCardContainer.style.display = "";
}

// open the dropdown menu on mobile devices
function mobileEditMenu(contact, event) {
  event.stopPropagation();
  let menu = document.getElementById("mobile-menu");
  menu.innerHTML = menuTempl(contact);
  menu.classList.toggle("mobile-menu");
  menu.classList.toggle("display-none");
  menu.querySelector(".mobile-edit-btn").addEventListener("click", () => {
    renderEditForm(contact);
  });
  menu.querySelector(".mobile-delete-btn").addEventListener("click", () => {
    deleteContact(contact.id);
  });
}

async function editContact(contactId, data) {

  await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  await mobileSucessfulEdited();
  await loadContacts();
  await showContactDetails(contactId);

  closeModal();
}

/**
 * Provides visual feedback for a successful contact edit on mobile devices.
 * Changes the background color of the mobile option menu temporarily.
 */
function mobileSucessfulEdited() {
  if (window.innerWidth <= 850) {
    let mobileMenuBtn = document.getElementById("mobile-option-menu");
    if (!mobileMenuBtn) return;
  setTimeout(() => {
  successMessage.classList.remove("show");
  successMessage.classList.add("display-none");
}, 3000);

  }
}

function markAsError() {
  const firstnameError = document.getElementById('firstname')
  const lastnameError = document.getElementById('lastname')
  const mailError = document.getElementById('email')
  const firstnameErrorMsg = document.getElementById('error-firstname')
  const lastnameErrorMsg = document.getElementById('error-lastname')
  const mailErrorMsg = document.getElementById('error-mail-adress')

    firstnameError.classList.add('error')
    firstnameErrorMsg.classList.remove('display-none')

    lastnameError.classList.add('error')
    lastnameErrorMsg.classList.remove('display-none')

    mailError.classList.add('error')
    mailErrorMsg.classList.remove('display-none')

    return
}

// delete a contact
async function deleteContact(contactId) {
  const contactImg = document.getElementById("modal-initials");
  if (contactImg) {
    contactImg.classList.remove("contact-initials");
  }
  await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
    method: "DELETE",
  });

  await loadContacts();
  const card = document.getElementById("contact-card-content");
  if (card) {
    card.innerHTML = "";
  }
}

function getAddFormData(){

    return {
        firstname: document.getElementById("add-firstname").value.trim(),
        lastname: document.getElementById("add-lastname").value.trim(),
        email: document.getElementById("add-email").value.trim(),
        phonenumber: document.getElementById("add-phone").value.trim()
    };

}

function getEditFormData(){

    return {
        firstname: document.getElementById("edit-firstname").value.trim(),
        lastname: document.getElementById("edit-lastname").value.trim(),
        email: document.getElementById("edit-email").value.trim(),
        phonenumber: document.getElementById("edit-phone").value.trim()
    };

}

// Function to set error message
function setError(inputId, message) {
    const inputGroup = document.getElementById(inputId).closest('.input-group');
    
    const existingError = inputGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    inputGroup.classList.add('error');
    
    const errorSpan = document.createElement('span');
    errorSpan.className = 'error-message';
    errorSpan.textContent = message;
    inputGroup.appendChild(errorSpan);
}

// Function to clear error from a specific field
function clearError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return; 

    const inputGroup = input.closest('.input-group');
    if (!inputGroup) return; 
    
    inputGroup.classList.remove('error');
    
    const existingError = inputGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

// Function to clear all errors
function clearAllErrors(formType) {
    const fields = formType === 'add' 
        ? ['add-firstname', 'add-lastname', 'add-email']
        : ['edit-firstname', 'edit-lastname', 'edit-email'];
    
    fields.forEach(id => {
        if (document.getElementById(id)) {
            clearError(id);
        }
    });
}

function validateContact(data, formType) {
    let isValid = true;

    clearAllErrors(formType);
    
    if (!data.firstname) {
        setError(formType === 'add' ? 'add-firstname' : 'edit-firstname', '* First name is required');
        isValid = false;
    } else if (data.firstname.length < 2) {
        setError(formType === 'add' ? 'add-firstname' : 'edit-firstname', '* First name must be at least 2 characters');
        isValid = false;
    }

    if (!data.lastname) {
        setError(formType === 'add' ? 'add-lastname' : 'edit-lastname', '* Last name is required');
        isValid = false;
    } else if (data.lastname.length < 2) {
        setError(formType === 'add' ? 'add-lastname' : 'edit-lastname', '* Last name must be at least 2 characters');
        isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email) {
        setError(formType === 'add' ? 'add-email' : 'edit-email', '* Email is required');
        isValid = false;
    } else if (!emailRegex.test(data.email)) {
        setError(formType === 'add' ? 'add-email' : 'edit-email', '* Please enter a valid email address');
        isValid = false;
    }
    
    return isValid;
}

function addInputValidationListeners() {

    const addInputs = ['add-firstname', 'add-lastname', 'add-email'];
    addInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {

            input.removeEventListener('input', handleInputValidation);
            input.addEventListener('input', handleInputValidation);
        }
    });

    // For edit form inputs
    const editInputs = ['edit-firstname', 'edit-lastname', 'edit-email'];
    editInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.removeEventListener('input', handleInputValidation);
            input.addEventListener('input', handleInputValidation);
        }
    });
}

// Handle input validation in real-time
function handleInputValidation(e) {
    const input = e.target;
    const inputId = input.id;
    const formType = inputId.startsWith('add-') ? 'add' : 'edit';
    
    clearError(inputId);
    const value = input.value.trim();
    if (inputId.includes('firstname') && value.length === 1) {
        return;
    }
    
    if (inputId.includes('lastname') && value.length === 1) {
        return;
    }
    
    if (inputId.includes('email') && value.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value) && value.length > 5) {
            setError(inputId, '* Please enter a valid email address');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    addInputValidationListeners();
});

function openModal() {
    contactModal.showModal();
    const modalInitials = document.getElementById("modal-initials");
    modalInitials.style.backgroundColor = "transparent";
    modalInitials.classList.remove("contact-initials");
    modalInitials.classList.add("profile-img");
    modalInitials.classList.remove("contact-initials-edit");
    modalInitials.textContent = "";
    leftSide.innerHTML = openModalLeftSide();
    contactWindow.innerHTML = openModalRightSide();

    setTimeout(() => {
        clearAllErrors('add');
        addInputValidationListeners();
    }, 100);
}

// Update renderEditForm function (keep this one)
function renderEditForm(contact) {
    leftSide.innerHTML = editFormleftSide();
    contactWindow.innerHTML = editFormRightSide(contact);
    const form = document.getElementById("edit-contact-form");
    form.dataset.id = contact.id;
    fillEditForm(contact);
    const contactImg = document.getElementById("modal-initials");
    contactImg.classList.add("contact-initials-edit");
    contactImg.classList.remove("contact-initials");
    contactImg.classList.remove("profile-img");
    showInitials(contact);
    
    contactModal.showModal();
    
    setTimeout(() => {
        clearAllErrors('edit');
        addInputValidationListeners();
    }, 100);
}

// Initialize validation listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    addInputValidationListeners();
});

document.addEventListener("submit", function(e) {
    if (e.target.id === "add-contact-form") {
        e.preventDefault();
        const data = getAddFormData();
        
        if (!validateContact(data, 'add')) return;
        
        addContact(data);
    }
});

document.addEventListener("submit", function(e) {
    if (e.target.id === "edit-contact-form") {
        e.preventDefault();
        const id = e.target.dataset.id;
        const data = getEditFormData();
        
        if (!validateContact(data, 'edit')) return;
        
        editContact(id, data);
    }
});

document.addEventListener("click", function(e) {
    if (e.target.id === "delete-contact") {
        const form = document.getElementById("edit-contact-form");
        const id = form.dataset.id;
        deleteContact(id);
    }
});

function fillEditForm(contact) {
    const form = document.getElementById("edit-contact-form");
    form.dataset.id = contact.id;
    document.getElementById("edit-firstname").value = contact.firstname;
    document.getElementById("edit-lastname").value = contact.lastname;
    document.getElementById("edit-email").value = contact.email;
    document.getElementById("edit-phone").value = contact.phonenumber;
}

document.addEventListener("click", function(e) {
    if (e.target.id === "cancel-add") {
        e.preventDefault();
        closeModal();
    }

    // Close mobile edit/delete menu when clicking outside
    let menu = document.getElementById("mobile-menu");
    let editContainer = document.querySelector(".mobile-edit-container");
    if (menu && !menu.classList.contains("display-none")) {
        if (!menu.contains(e.target) && (!editContainer || !editContainer.contains(e.target))) {
            menu.classList.add("display-none");
            menu.classList.remove("mobile-menu");
        }
    }
});