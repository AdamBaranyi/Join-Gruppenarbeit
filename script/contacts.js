let currentUser;
let userId;
let url;
let leftSide = document.getElementById("left-side-modal ");
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
        const cardWrapper = document.getElementById("contact-card");
        cardWrapper.classList.remove("show");

        setTimeout(() => {
          cardWrapper.classList.add("show");
        }, 10);
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
  contactModal.showModal();
  const modalInitials = document.getElementById("modal-initials");
  modalInitials.style.backgroundColor = "transparent";
  modalInitials.classList.remove("contact-initials");
  modalInitials.classList.add("profile-img");
  modalInitials.classList.remove("contact-initials-edit");
  modalInitials.textContent = "";
  leftSide.innerHTML = openModalLeftSide();
  contactWindow.innerHTML = openModalRightSide();
}

// close the modal
function closeModal() {
  contactModal.close();
}

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

  // Remove legacy inline styles if present
  if (contactListContainer) contactListContainer.style.display = "";
  if (sloganAndCardContainer) sloganAndCardContainer.style.display = "";

  card.classList.remove("display-none");
  mainContent.classList.add("show-contact-card");
  card.innerHTML = contactCard(contact);
  card.querySelector(".edit-btn").addEventListener("click", () => {
    renderEditForm(contact);
  });
  card.querySelector(".delete-btn").addEventListener("click", () => {
    deleteContact(contact.id);
  });
  showInitials(contact);
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

// load initials from first and last name
function showInitials(contact) {
  const cardInitials = document.getElementById("contact-initials");
  const modalInitials = document.getElementById("modal-initials");

  if (!modalInitials && !cardInitials) return;

  const fullName = contact.firstname + contact.lastname;

  cardInitials.style.backgroundColor = getColorFromName(fullName);
  modalInitials.style.backgroundColor = getColorFromName(fullName);
  if (cardInitials && modalInitials) {
    let initials = contact.firstname.charAt(0) + contact.lastname.charAt(0);
    cardInitials.textContent = initials.toUpperCase();
    modalInitials.textContent = initials.toUpperCase();
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

  // Remove legacy inline styles if present
  if (contactListContainer) contactListContainer.style.display = "";
  if (sloganAndCardContainer) sloganAndCardContainer.style.display = "";
}

// open the modal to edit a contact
function renderEditForm(contact) {
  openModal();
  leftSide.innerHTML = editFormleftSide();
  contactWindow.innerHTML = editFormRightSide(contact);
  const contactImg = document.getElementById("modal-initials");

  contactImg.classList.add("contact-initials-edit");
  contactImg.classList.remove("contact-initials");
  contactImg.classList.remove("profile-img");
  showInitials(contact);
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

// edit a contact
async function editContact(contactId) {
  const firstname = document.getElementById("firstname").value;
  const lastname = document.getElementById("lastname").value;
  const email = document.getElementById("email").value;
  const phonenumber = document.getElementById("phonenumber").value;
  const contactImg = document.getElementById("modal-initials");
  contactImg.classList.add("contact-initials");
  contactImg.classList.remove("profile-img");
  const updatedContact = {
    firstname,
    lastname,
    email,
    phonenumber,
  };
  await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedContact),
  });
  await mobileSucessfulEdited();
  await loadContacts();
  await showContactDetails(contactId);
}

function mobileSucessfulEdited() {
  if (window.innerWidth <= 850) {
    let mobileMenuBtn = document.getElementById("mobile-option-menu");
    if (!mobileMenuBtn) return;
    setTimeout(() => {
      mobileMenuBtn.style.backgroundColor = "var(--color-secondary)";
    }, 10);
    setTimeout(() => {
      mobileMenuBtn.style.backgroundColor = "var(--color-primary)";
    }, 3000);
  }
}

function markAsError() {
  const firstnameError = document.getElementById('fristname')
  const lastnameError = document.getElementById('lastname')
  const mailError = document.getElementById('email')
  const firstnameErrorMsg = document.getElementById('error-fristname')
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

function cancelContact() {
  document.getElementById("contact-form").reset();
  closeModal();
}

