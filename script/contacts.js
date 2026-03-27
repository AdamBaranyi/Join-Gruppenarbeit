let userId;
let url;
let leftSide = document.getElementById("left-side-modal");
const contactWindow = document.getElementById("contact-modal");
const contactModal = document.getElementById("dialog-modal");


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

/**
 * Loads all contacts from Firebase and renders them in the contact list.
 */
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

/**
 * Renders the contact list with contacts grouped by the first letter of firstname.
 * @param {Array} contacts - Array of contact objects to render.
 */
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

/**
 * Sorts contacts alphabetically by firstname.
 * @param {Array} contacts - Array of contact objects to sort.
 * @returns {Array} Sorted array of contacts.
 */
function sortContactsByFirstname(contacts) {
  return [...contacts].sort((a, b) =>
    a.firstname.localeCompare(b.firstname, "de", { sensitivity: "base" }),
  );
}

/**
 * Groups contacts by the first letter of their firstname.
 * @param {Array} contacts - Array of contact objects to group.
 * @returns {Object} Object with letters as keys and arrays of contacts as values.
 */
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

/**
 * Generates a consistent color from the contact name using a hash function.
 * @param {string} name - The contact name to generate a color for.
 * @returns {string} A hex color code from the predefined color palette.
 */
function getColorFromName(name) {
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % contactColors.length;
  return contactColors[index];
}

/**
 * Opens the modal dialog to create a new contact.
 */
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
/**
 * Closes the modal dialog with a slide-out animation.
 */
function closeModal() {
  contactModal.classList.add("slide-out");
  setTimeout(() => {
    contactModal.close();
    contactModal.classList.remove("slide-out");
  }, 380);
}

/**
 * Adds a new contact to Firebase and updates the contact list.
 * @param {Object} contactData - The contact data (firstname, lastname, email, phonenumber).
 * @returns {string|undefined} The new contact ID if successful.
 */
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

/**
 * Displays a success message after creating a new contact.
 */
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


/**
 * Renders the contact card with the details of a selected contact.
 * @param {Object} contact - The contact object to display.
 */
function renderContactCard(contact) {
  const card = document.getElementById("contact-card-content");
  helpRenderContactCard(contact);
  card.querySelector(".edit-btn").addEventListener("click", () => {
    renderEditForm(contact);
  });
  card.querySelector(".delete-btn").addEventListener("click", () => {
    deleteContact(contact.id);
  });
}

/**
 * Displays the contact initials with a colored background in the card and modal.
 * @param {Object} contact - The contact object containing firstname and lastname.
 */
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

/**
 * Closes the contact card on mobile devices.
 */
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

/**
 * Opens the edit/delete dropdown menu on mobile devices.
 * @param {Object} contact - The contact object.
 * @param {Event} event - The click event.
 */
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

/**
 * Updates an existing contact in Firebase.
 * @param {string} contactId - The ID of the contact to update.
 * @param {Object} data - The updated contact data.
 */
async function editContact(contactId, data) {
  await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  mobileSucessfulEdited();
  await loadContacts();
  await showContactDetails(contactId);
  closeModal();
}

/**
 * Provides visual feedback for a successful contact edit on mobile devices.
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

/**
 * Deletes a contact from Firebase and updates the UI.
 * @param {string} contactId - The ID of the contact to delete.
 */
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
  if (window.innerWidth = 850) {
    closeContactCard()
  }
}

/**
 * Sets an error message for a specific input field.
 * @param {string} inputId - The ID of the input element.
 * @param {string} message - The error message to display.
 */
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

/**
 * Clears the error message from a specific input field.
 * @param {string} inputId - The ID of the input element.
 */
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

/**
 * Clears all error messages from the form.
 * @param {string} formType - The form type ('add' or 'edit').
 */
function clearAllErrors(formType) {
    const fields = formType === 'add'
        ? ['add-firstname', 'add-lastname', 'add-email', 'add-phone']
        : ['edit-firstname', 'edit-lastname', 'edit-email', 'edit-phone'];

    fields.forEach(id => {
        if (document.getElementById(id)) {
            clearError(id);
        }
    });
}

/**
 * Validates all fields in the contact form.
 * @param {Object} data - The contact data to validate.
 * @param {string} formType - The form type ('add' or 'edit').
 * @returns {boolean} True if all fields are valid, false otherwise.
 */
function validateContact(data, formType) {
  let allValid;
  clearAllErrors(formType);

  const firstnameValid = checkFirstname(data, formType);
  const lastnameValid = checkLastname(data, formType);
  const mailValid = checkMail(data, formType);
  const phoneValid = checkPhone(data, formType);

  if (firstnameValid && lastnameValid && mailValid && phoneValid) {
    allValid = true
  }
  else {allValid = false}
  return allValid;
}

/**
 * Adds real-time input validation listeners to form fields.
 */
function addInputValidationListeners() {
    const addInputs = ['add-firstname', 'add-lastname', 'add-email', 'add-phone'];
    addInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {

            input.removeEventListener('input', handleInputValidation);
            input.addEventListener('input', handleInputValidation);
        }
    });
    // For edit form inputs
    const editInputs = ['edit-firstname', 'edit-lastname', 'edit-email', 'edit-phone'];
    editInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.removeEventListener('input', handleInputValidation);
            input.addEventListener('input', handleInputValidation);
        }
    });
}

/**
 * Handles real-time input validation as the user types.
 * @param {Event} e - The input event.
 */
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
    if (inputId.includes('phone') && value.length > 0 && value.length < 6) {
        setError(inputId, '* Phone number must be at least 6 digits');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    addInputValidationListeners();
});

/**
 * Opens the modal with the edit form populated with contact data.
 * @param {Object} contact - The contact object to edit.
 */
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
        
        if (!validateContact(data, 'add')) {return}
          else {
            addContact(data);
          };
    }
});

document.addEventListener("submit", function(e) {
    if (e.target.id === "edit-contact-form") {
        e.preventDefault();
        const id = e.target.dataset.id;
        const data = getEditFormData();
        
        if (!validateContact(data, 'edit')) {return}
          else {
            editContact(id, data);
          };
        
    }
});

document.addEventListener("click", function(e) {
    if (e.target.id === "delete-contact") {
        const form = document.getElementById("edit-contact-form");
        const id = form.dataset.id;
        closeModal()
        deleteContact(id);
    }
});

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