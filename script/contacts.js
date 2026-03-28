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

  clearActiveContacts();
  container.innerHTML = "";
  renderGroupedContacts(container, groups);
}

/**
 * Clears active state from all contact rows.
 */
function clearActiveContacts() {
  document
    .querySelectorAll(".contact-row")
    .forEach((row) => row.classList.remove("active"));
}

/**
 * Renders grouped contacts into the container.
 * @param {HTMLElement} container - The container element.
 * @param {Object} groups - The grouped contacts object.
 */
function renderGroupedContacts(container, groups) {
  Object.keys(groups)
    .sort()
    .forEach((letter) => {
      container.innerHTML += renderLetterHeader(letter);
      renderContactsForLetter(container, groups[letter]);
    });
}

/**
 * Renders all contacts for a specific letter group.
 * @param {HTMLElement} container - The container element.
 * @param {Array} contacts - Array of contacts for this letter.
 */
function renderContactsForLetter(container, contacts) {
  contacts.forEach((contact) => {
    const initials = contact.firstname.charAt(0) + contact.lastname.charAt(0);
    const bgColor = getColorFromName(contact.firstname + contact.lastname);
    container.innerHTML += renderContactListItem(contact, initials, bgColor);
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
    resetModalInitials();
    populateAddContactForm();
    initializeAddFormValidation();
}

/**
 * Resets the modal initials styling.
 */
function resetModalInitials() {
    const modalInitials = document.getElementById("modal-initials");
    modalInitials.style.backgroundColor = "transparent";
    modalInitials.classList.remove("contact-initials", "contact-initials-edit");
    modalInitials.classList.add("profile-img");
    modalInitials.textContent = "";
}

/**
 * Populates the add contact form.
 */
function populateAddContactForm() {
    leftSide.innerHTML = openModalLeftSide();
    contactWindow.innerHTML = openModalRightSide();
}

/**
 * Initializes validation for add form.
 */
function initializeAddFormValidation() {
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
  if (contactData.firstname !== "" && contactData.lastname !== "" && contactData.email !== "") {
    const newId = generateNextContactId(contacts);
    const contactWithId = { id: newId, ...contactData };
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
    const fullName = contact.firstname + contact.lastname;
    const initials = contact.firstname.charAt(0) + contact.lastname.charAt(0);
    const color = getColorFromName(fullName);

    updateInitialsElement("contact-initials", initials, color);
    updateInitialsElement("modal-initials", initials, color);
}

/**
 * Updates an initials element with initials and color.
 * @param {string} elementId - The element ID.
 * @param {string} initials - The initials to display.
 * @param {string} color - The background color.
 */
function updateInitialsElement(elementId, initials, color) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.backgroundColor = color;
        element.textContent = initials.toUpperCase();
    }
}

/**
 * Closes the contact card on mobile devices.
 */
function closeContactCard() {
  const card = document.getElementById("contact-card-content");
  const mainContent = document.querySelector(".main-content");

  card.innerHTML = "";
  mainContent.classList.remove("show-contact-card");
  resetContactDisplayContainers();
}

/**
 * Resets the display of contact list containers.
 */
function resetContactDisplayContainers() {
  const contactListContainer = document.getElementById("contact-list-container");
  const sloganAndCardContainer = document.getElementById("slogan-and-card-container");

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
 * Opens the modal with the edit form populated with contact data.
 * @param {Object} contact - The contact object to edit.
 */
function renderEditForm(contact) {
    populateEditModalContent(contact);
    setupEditFormData(contact);
    updateEditModalInitials(contact);
    contactModal.showModal();
    initializeEditFormValidation();
}

/**
 * Populates the edit modal with form content.
 * @param {Object} contact - The contact object.
 */
function populateEditModalContent(contact) {
    leftSide.innerHTML = editFormleftSide();
    contactWindow.innerHTML = editFormRightSide(contact);
}

/**
 * Sets up the edit form with contact data.
 * @param {Object} contact - The contact object.
 */
function setupEditFormData(contact) {
    const form = document.getElementById("edit-contact-form");
    form.dataset.id = contact.id;
    fillEditForm(contact);
}

/**
 * Updates the modal initials for edit mode.
 * @param {Object} contact - The contact object.
 */
function updateEditModalInitials(contact) {
    const contactImg = document.getElementById("modal-initials");
    contactImg.classList.add("contact-initials-edit");
    contactImg.classList.remove("contact-initials", "profile-img");
    showInitials(contact);
}

/**
 * Initializes validation for edit form.
 */
function initializeEditFormValidation() {
    setTimeout(() => {
        clearAllErrors('edit');
        addInputValidationListeners();
    }, 100);
}