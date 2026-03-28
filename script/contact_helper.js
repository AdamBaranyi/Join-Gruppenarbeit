/**
 * Initializes and renders the contact card with the provided contact information.
 * @param {Object} contact - The contact object containing contact details.
 */
function helpRenderContactCard(contact) {
    resetContainerDisplays();
    displayContactCard(contact);
    animateCardEntry();
}

/**
 * Resets the display properties of contact containers.
 */
function resetContainerDisplays() {
    const sloganAndCardContainer = document.getElementById("slogan-and-card-container");
    const contactListContainer = document.getElementById("contact-list-container");

    if (contactListContainer) contactListContainer.style.display = "";
    if (sloganAndCardContainer) sloganAndCardContainer.style.display = "";
}

/**
 * Displays the contact card with contact information.
 * @param {Object} contact - The contact object.
 */
function displayContactCard(contact) {
    const card = document.getElementById("contact-card-content");
    const mainContent = document.querySelector(".main-content");

    card.classList.remove("display-none");
    mainContent.classList.add("show-contact-card");
    card.innerHTML = contactCard(contact);
    showInitials(contact);
}

/**
 * Animates the card entry.
 */
function animateCardEntry() {
    const cardWrapper = document.getElementById("contact-card");
    cardWrapper.classList.remove("show");
    setTimeout(() => {cardWrapper.classList.add("show");}, 10);
}

/**
 * Adjusts the contact card display for mobile devices based on window width.
 */
function checkForMobileRenderCard() {
  const elements = getMobileCardElements();

  if (window.innerWidth <= 850) {
    applyMobileLayout(elements);
  } else {
    applyDesktopLayout(elements);
  }
}

/**
 * Gets all elements needed for mobile card rendering.
 * @returns {Object} Object containing all relevant elements.
 */
function getMobileCardElements() {
  return {
    card: document.getElementById("contact-card-content"),
    sloganContainer: document.getElementById("slogan-and-card-container"),
    listContainer: document.getElementById("contact-list-container"),
    closeBtn: document.getElementById("close-card-btn"),
    mobileSlogan: document.getElementById("mobile-slogan")
  };
}

/**
 * Applies mobile layout to contact card.
 * @param {Object} elements - The elements object.
 */
function applyMobileLayout(elements) {
  elements.mobileSlogan.classList.remove("display-none");
  elements.card.classList.remove("display-none");
  elements.closeBtn.classList.remove("display-none");
  elements.listContainer.style.display = "none";
  elements.sloganContainer.style.display = "flex";
}

/**
 * Applies desktop layout to contact card.
 * @param {Object} elements - The elements object.
 */
function applyDesktopLayout(elements) {
  elements.mobileSlogan.classList.add("display-none");
  elements.card.classList.remove("display-none");
  elements.closeBtn.classList.add("display-none");
  elements.listContainer.style.display = "flex";
}

// Ensure ESC key triggers the smooth CSS close animation
document.addEventListener("DOMContentLoaded", () => {
    const dialogModal = document.getElementById("dialog-modal");
    if (dialogModal) {
        dialogModal.addEventListener("cancel", (e) => {
            e.preventDefault();
            closeModal();
        });
    }
});

/**
 * Validates the firstname field in the contact form.
 * @param {Object} data - The contact data object containing firstname.
 * @param {string} formType - The form type ('add' or 'edit').
 * @returns {boolean} True if valid, false otherwise.
 */
function checkFirstname(data, formType) {
  let isValid;
  if (!data.firstname) {
        setError(formType === 'add' ? 'add-firstname' : 'edit-firstname', '* First name is required');
        isValid = false;
    } else if (data.firstname.length < 2) {
        setError(formType === 'add' ? 'add-firstname' : 'edit-firstname', '* First name must be at least 2 characters');
        isValid = false;
    } else {isValid = true}
    return isValid;
}

/**
 * Validates the lastname field in the contact form.
 * @param {Object} data - The contact data object containing lastname.
 * @param {string} formType - The form type ('add' or 'edit').
 * @returns {boolean} True if valid, false otherwise.
 */
function checkLastname(data, formType) {
  let isValid;
  if (!data.lastname) {
        setError(formType === 'add' ? 'add-lastname' : 'edit-lastname', '* Last name is required');
        isValid = false;
    } else if (data.lastname.length < 2) {
        setError(formType === 'add' ? 'add-lastname' : 'edit-lastname', '* Last name must be at least 2 characters');
        isValid = false;
    } else {isValid = true}
    return isValid;
}

/**
 * Validates the email field in the contact form.
 * @param {Object} data - The contact data object containing email.
 * @param {string} formType - The form type ('add' or 'edit').
 * @returns {boolean} True if valid, false otherwise.
 */
function checkMail(data, formType) {
  let isValid;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email) {
        setError(formType === 'add' ? 'add-email' : 'edit-email', '* Email is required');
        isValid = false;
    } else if (!emailRegex.test(data.email)) {
        setError(formType === 'add' ? 'add-email' : 'edit-email', '* Please enter a valid email address');
        isValid = false;
    } else {isValid = true}
    return isValid;
}

/**
 * Validates the phone number field in the contact form.
 * @param {Object} data - The contact data object containing phonenumber.
 * @param {string} formType - The form type ('add' or 'edit').
 * @returns {boolean} True if valid, false otherwise.
 */
function checkPhone(data, formType) {
  let isValid;
    if (!data.phonenumber) {
        setError(formType === 'add' ? 'add-phone' : 'edit-phone', '* Phone number is required');
        isValid = false;
    } else if (data.phonenumber.length < 6) {
        setError(formType === 'add' ? 'add-phone' : 'edit-phone', '* Phone number must be at least 6 digits');
        isValid = false;
    } else {isValid = true}
    return isValid;
}

/**
 * Saves a new contact to the Firebase database.
 * @param {string} newId - The unique ID for the new contact.
 * @param {Object} contactWithId - The contact object with ID included.
 */
async function putContactInBackend(newId, contactWithId) {
  await fetch(`${BASE_URL}/contacts/${newId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactWithId),
  });
}

/**
 * Loads and displays the details of a specific contact.
 * @param {string} contactId - The unique ID of the contact to display.
 */
async function showContactDetails(contactId) {
  const response = await fetch(url);
  const data = await response.json();

  if (!data) return;

  const contact = data[contactId];
  renderContactCard(contact);
}

/**
 * Marks form fields as invalid by adding error styling.
 * @deprecated This function is no longer used in the current validation system.
 */
function markAsError() {
  const elements = getErrorElements();
  applyErrorStyling(elements);
}

/**
 * Gets all error-related elements.
 * @returns {Object} Object containing error elements.
 */
function getErrorElements() {
  return {
    firstnameInput: document.getElementById('firstname'),
    lastnameInput: document.getElementById('lastname'),
    mailInput: document.getElementById('email'),
    firstnameMsg: document.getElementById('error-firstname'),
    lastnameMsg: document.getElementById('error-lastname'),
    mailMsg: document.getElementById('error-mail-adress')
  };
}

/**
 * Applies error styling to form elements.
 * @param {Object} elements - The error elements object.
 */
function applyErrorStyling(elements) {
  elements.firstnameInput.classList.add('error');
  elements.firstnameMsg.classList.remove('display-none');
  elements.lastnameInput.classList.add('error');
  elements.lastnameMsg.classList.remove('display-none');
  elements.mailInput.classList.add('error');
  elements.mailMsg.classList.remove('display-none');
}

/**
 * Generates the next contact ID.
 * @param {Object} contacts - Existing contacts object.
 * @returns {string} The new contact ID.
 */
function generateNextContactId(contacts) {
    const nextIdNumber = calculateNextIdNumber(contacts);
    return `c${nextIdNumber}`;
}

/**
 * Calculates the next ID number from existing contacts.
 * @param {Object} contacts - Existing contacts object.
 * @returns {number} The next ID number.
 */
function calculateNextIdNumber(contacts) {
    if (!contacts) return 1;

    const ids = extractContactIdNumbers(contacts);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

/**
 * Extracts numeric ID values from contacts.
 * @param {Object} contacts - The contacts object.
 * @returns {number[]} Array of numeric IDs.
 */
function extractContactIdNumbers(contacts) {
    return Object.keys(contacts)
        .filter((id) => id.startsWith("c"))
        .map((id) => parseInt(id.substring(1)))
        .filter((num) => !isNaN(num));
}

/**
 * Retrieves form data from the add contact form.
 * @returns {Object} An object containing the contact data (firstname, lastname, email, phonenumber).
 */
function getAddFormData(){
    return {
        firstname: document.getElementById("add-firstname").value.trim(),
        lastname: document.getElementById("add-lastname").value.trim(),
        email: document.getElementById("add-email").value.trim(),
        phonenumber: document.getElementById("add-phone").value.trim()
    };

}

/**
 * Retrieves form data from the edit contact form.
 * @returns {Object} An object containing the contact data (firstname, lastname, email, phonenumber).
 */
function getEditFormData(){
    return {
        firstname: document.getElementById("edit-firstname").value.trim(),
        lastname: document.getElementById("edit-lastname").value.trim(),
        email: document.getElementById("edit-email").value.trim(),
        phonenumber: document.getElementById("edit-phone").value.trim()
    };

}

/**
 * Populates the edit contact form with the contact's current data.
 * @param {Object} contact - The contact object containing the data to fill into the form.
 */
function fillEditForm(contact) {
    const form = document.getElementById("edit-contact-form");
    form.dataset.id = contact.id;
    document.getElementById("edit-firstname").value = contact.firstname;
    document.getElementById("edit-lastname").value = contact.lastname;
    document.getElementById("edit-email").value = contact.email;
    document.getElementById("edit-phone").value = contact.phonenumber;
}

/**
 * Changes the display of the contact image to show the user contact initials.
 */
function changeDisplayToEditCard() {
  const contactImg = document.getElementById("modal-initials");
  contactImg.classList.add("contact-initials-edit");
  contactImg.classList.remove("contact-initials");
  contactImg.classList.remove("profile-img");
}

/**
 *  Closes the contact card and resets the display for mobile devices if necessary.
 * @returns 
 */
function mobileDeleteContactResponse() {
  if (window.innerWidth = 850) {
    closeContactCard()
  }
  else {return}
}

/**
 * Removes the "active" class from all contact rows to reset their state.
 */
function removeActiveClass() {
  document
    .querySelectorAll(".contact-row")
    .forEach((row) => row.classList.remove("active"));
}

/**
 * Styles the contact list items based on their first letter.
 * @param {Array} contacts - Array of contact objects to style.
    * This function sorts the contacts by their first name, groups them by the first letter, 
    * and then renders each contact with appropriate styling. 
    * It also adds letter headers for each group of contacts.
 */
function stylingForContactListItem(contacts) {
  const container = document.getElementById("contact-list-content");
  const sorted = sortContactsByFirstname(contacts);
  const groups = groupContactsByLetter(sorted);
  Object.keys(groups) .sort() .forEach((letter) => {
      container.innerHTML += `<div class="letter-header">${letter}</div>`;
      groups[letter].forEach((contact) => {
        const initials = contact.firstname.charAt(0) + contact.lastname.charAt(0);
        const bgColor = getColorFromName(contact.firstname + contact.lastname);
        container.innerHTML += renderContactListItem(contact, initials, bgColor);
      });
    });
}