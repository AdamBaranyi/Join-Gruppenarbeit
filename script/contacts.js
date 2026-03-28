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
  removeActiveClass();
  container.innerHTML = "";
  stylingForContactListItem(contacts);
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
  const contactListContainer = document.getElementById("contact-list-container",);
  const sloganAndCardContainer = document.getElementById("slogan-and-card-container",);

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
  mobileDeleteContactResponse();
}

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
    changeDisplayToEditCard();
    showInitials(contact);
    contactModal.showModal();
    setTimeout(() => {
        clearAllErrors('edit');
        addInputValidationListeners();
    }, 100);
}

