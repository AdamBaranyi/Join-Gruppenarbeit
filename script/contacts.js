let currentUser;
let userId;
let url;
let leftSide = document.getElementById('leftSideModal');
const contactWindow = document.getElementById("contactModal")
const contactModal = document.getElementById("dialogModal")

//load current user from session storage
function getCurrentUser() {
  let currentUser = JSON.parse(sessionStorage.getItem("current_user"));
  console.log("current User:", currentUser )
  return currentUser;
}

// sort contacts by firstname
function sortContactsByFirstname(contacts) {
  return [...contacts].sort((a, b) =>
    a.firstname.localeCompare(b.firstname, "de", { sensitivity: "base" })
  );
}

// group contacts by the first letter of the firstname
function groupContactsByLetter(contacts) {
  const groups = {};

  contacts.forEach(contact => {
    const letter = contact.firstname.charAt(0).toUpperCase();

    if (!groups[letter]) {
      groups[letter] = [];
    };
    groups[letter].push(contact);
  });

  return groups;
}

// load contacts of a user
async function loadContacts() {
  currentUser = getCurrentUser()?.id;
  userId = currentUser || "guest";
  url = `${BASE_URL}/contacts/${userId}.json`;
  
  const response = await fetch(url);
  const data = await response.json();

  const contacts = data ? Object.values(data) : [];
  renderContactList(contacts);
}

// render contact list with currentuser contacts
function renderContactList(contacts) {
  const container = document.getElementById("contactListContent");
  const sorted = sortContactsByFirstname(contacts);
  const groups = groupContactsByLetter(sorted);

  document.querySelectorAll(".contactRow").forEach(row =>
  row.classList.remove("active")

);


  container.innerHTML = "";
  Object.keys(groups).sort().forEach(letter => {

    container.innerHTML += `
      <div class="letterHeader">${letter}</div>
    `;
    groups[letter].forEach(contact => {
  const initials =
    contact.firstname.charAt(0) +
    contact.lastname.charAt(0);

  const bgColor = getColorFromName(contact.firstname + contact.lastname);

  container.innerHTML += renderContactListItem(contact, initials, bgColor);

  const cardWrapper = document.getElementById("contactCard");
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
  "#FF745E"
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
  const modalInitials = document.getElementById("modalInitials");
  modalInitials.style.backgroundColor = "transparent";
  modalInitials.classList.remove("contact-initials");
  modalInitials.classList.add('profileImg');
  modalInitials.textContent = '';
  leftSide.innerHTML = openModalLeftSide();
  contactWindow.innerHTML = openModalRightSide();
};

// close the modal
function closeModal() {
  contactModal.close();
};

// add a new contact
async function addContact(contactData) {
    const res = await fetch(url);
    const contacts = await res.json();
  if (contactData.firstname !== "" && contactData.lastname !== "" && contactData.email !== "") {
    let nextIdNumber = 1;

      if (contacts) {
          const ids = Object.keys(contacts)
              .filter(id => id.startsWith("c"))
              .map(id => parseInt(id.substring(1)))
              .filter(num => !isNaN(num));

          if (ids.length > 0) {
              nextIdNumber = Math.max(...ids) + 1;
          }
      }
      const newId = `c${nextIdNumber}`;
      const contactWithId = {
          id: newId,
          ...contactData
      };
      await putContactInBackend(newId, contactWithId);
      await loadContacts();
      showSuccessMessage();
      return newId;
  }else {
    return;
  }
};

// save a new contact to the database
async function putContactInBackend(newId, contactWithId) {
  await fetch(`${BASE_URL}/contacts/${userId}/${newId}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactWithId)
      });
}

// show a success message after creating a new contact
function showSuccessMessage() {
    let successMessage = document.getElementById('successMessage');
    successMessage.classList.remove('displayNone');
    setTimeout(() => {
        successMessage.classList.add('show');
    }, 10);
    setTimeout(() => {
        successMessage.classList.add('displayNone');
    }, 3000);
}

async function showContactDetails(contactId) {
  const response = await fetch(url);
  const data = await response.json();

  if (!data) return;

  const contact = data[contactId];
  renderContactCard(contact);
};


// render contact card with the details of a contact
function renderContactCard(contact) {
  const card = document.getElementById("contactCardContent");
  if (window.innerWidth <= 850){
  const sloganAndCardContainer = document.getElementById("sloganAndCardContainer");
  const contactListContainer = document.getElementById("contactListContainer");
  const closeCardBtn = document.getElementById("closeCardBtn");
  const mobileSlogan = document.getElementById("mobileSlogan");
    
  mobileSlogan.classList.remove("displayNone");
  card.classList.remove("displayNone");
  closeCardBtn.classList.remove("displayNone");
  contactListContainer.classList.add("displayNone");
  sloganAndCardContainer.style.display = "flex";
  }  
  card.innerHTML = contactCard(contact);
  card.querySelector(".editBtn").addEventListener("click", () => {
    renderEditForm(contact);
  });
  card.querySelector(".deleteBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this contact?")) {
      deleteContact(contact.id);
    }
  });
  showInitials(contact);
}


// load initials from first and last name
function showInitials(contact) {
  const cardInitials = document.getElementById("contactInitials");
  const modalInitials = document.getElementById('modalInitials');

  if (!modalInitials && !cardInitials) return;

  const fullName = contact.firstname + contact.lastname;

  cardInitials.style.backgroundColor = getColorFromName(fullName);
  modalInitials.style.backgroundColor = getColorFromName(fullName);
      if (cardInitials && modalInitials) { 
        console.log("contact name:", contact.firstname + contact.lastname);
        let initials =
        contact.firstname.charAt(0) +
        contact.lastname.charAt(0);
        cardInitials.textContent = initials.toUpperCase();
        modalInitials.textContent= initials.toUpperCase();
    }
}


// close the contact card on mobile devices
function closeContactCard() {
  const card = document.getElementById("contactCardContent");
  if (window.innerWidth <= 850){
  const sloganAndCardContainer = document.getElementById("sloganAndCardContainer");
  const contactListContainer = document.getElementById("contactListContainer");
  const closeCardBtn = document.getElementById("closeCardBtn");
  
  card.innerHTML = '';
  card.classList.add("displayNone");
  closeCardBtn.classList.add("displayNone");
  contactListContainer.classList.remove("displayNone");
  sloganAndCardContainer.style.display = "none";
  }
}

// open the modal to edit a contact
function renderEditForm(contact) {
  openModal();
  leftSide.innerHTML = editFormleftSide();
  contactWindow.innerHTML = editFormRightSide(contact);
  const contactImg = document.getElementById("modalInitials");
  contactImg.classList.add("contact-initials")
  contactImg.classList.remove("profileImg")
  showInitials(contact);
}

// open the dropdown menu on mobile devices
function mobileEditMenu(contact, event) {
  event.stopPropagation();
  let menu = document.getElementById('mobileMenu');
  menu.innerHTML = menuTempl(contact);
  menu.classList.toggle('mobileMenu');
  menu.classList.toggle("displayNone");
  menu.querySelector(".mobileEditBtn").addEventListener("click", () => {
    renderEditForm(contact);
  });
  menu.querySelector(".mobileDeleteBtn").addEventListener("click", () => {
    deleteContact(contact.id);
  });
}

// edit a contact
async function editContact(contactId) {
  const firstname = document.getElementById('firstname').value;
  const lastname = document.getElementById('lastname').value;
  const email = document.getElementById('email').value;
  const contactImg = document.getElementById("modalInitials");
  contactImg.classList.add("contact-initials");
  contactImg.classList.remove("profileImg");
  const updatedContact = {
    firstname,
    lastname,
    email
  };
  await fetch(`${BASE_URL}/contacts/${userId}/${contactId}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedContact)
  });

  await loadContacts();
  await showContactDetails(contactId);
}

// delete a contact
async function deleteContact(contactId) {
  const contactImg = document.getElementById("modalInitials");
  contactImg.classList.remove("contact-initials")
  await fetch(`${BASE_URL}/contacts/${userId}/${contactId}.json`, {
    method: "DELETE"
  });

  await loadContacts();
  const card = document.getElementById("contactCardContent");
  card.innerHTML = '';
}

// clear the input fields in the modal
function cancelContact() {
  let firstname = document.getElementById('firstname');
  let lastname = document.getElementById('lastname');
  let email = document.getElementById('email');

  firstname.value ='';
  lastname.value ='';
  email.value ='';
};