const BASE_URL = "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/";
const currentUser = getCurrentUser()?.id;
const userId = currentUser || "guest";
const url = `${BASE_URL}/contacts/${userId}.json`;
let leftSide = document.getElementById('leftSideModal');
const contactWindow = document.getElementById("contactModal")
const contactModal = document.getElementById("dialogModal")

// zum laden des aktuellen Nutzers aus der Session Storage
function getCurrentUser() {
  let currentUser = JSON.parse(sessionStorage.getItem("current_user"));
  console.log("current User:", currentUser )
  return currentUser;
}

// zum sortieren der Kontakte nach dem Vornamen
function sortContactsByFirstname(contacts) {
  return [...contacts].sort((a, b) =>
    a.firstname.localeCompare(b.firstname, "de", { sensitivity: "base" })
  );
}

// zum gruppieren der Kontakte nach dem Anfangsbuchstaben des Vornamens
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

// zum laden der Kontakte eines Nutzers
async function loadContacts() {
  const response = await fetch(url);
  const data = await response.json();

  const contacts = data ? Object.values(data) : [];
  renderContactList(contacts);
}

// zum rendern der Kontaktliste mit den Kontakten eines Nutzers
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

// zum öffnen des Modals zum Erstellen eines neuen Kontakts
function openModal() {
  contactModal.showModal();
  const modalInitials = document.getElementById("modalInitials");
  modalInitials.style.backgroundColor = "transparent";
  modalInitials.classList.remove("contact-initials");
  modalInitials.classList.add('profileImg');
  leftSide.innerHTML = openModalLeftSide();
  contactWindow.innerHTML = openModalRightSide();
};

// zum schließen des Modals
function closeModal() {
  contactModal.close();
};
  
// zum hinzufügen eines neuen Kontakts
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

// zum speichern eines neuen Kontakts in der Datenbank
async function putContactInBackend(newId, contactWithId) {
  await fetch(`${BASE_URL}/contacts/${userId}/${newId}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactWithId)
      });
}

// zum anzeigen einer Erfolgsmeldung nach dem Erstellen eines neuen Kontakts
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


// zum rendern der Kontaktkarte mit den Details eines Kontakts
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


// zum laden der Initalien von Vor- und Nachnamen
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


// zum schließen der Kontaktkarte auf mobilen Geräten
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

// zum öffnen des Modals zum Bearbeiten eines Kontakts
function renderEditForm(contact) {
  openModal();
  leftSide.innerHTML = editFormleftSide();
  contactWindow.innerHTML = editFormRightSide(contact);
  const contactImg = document.getElementById("modalInitials");
  contactImg.classList.add("contact-initials")
  contactImg.classList.remove("profileImg")
  showInitials(contact);
}

// zum öffnen des dropdown menus auf mobilen Geräten
function mobileEditMenu(contact) {
  let menu = document.createElement('div');
  const mobileOptionsBtn = document.getElementById('mobileOptionsBtn');
  mobileOptionsBtn.addEventListener('click', () => {
    menu.classList.add('mobile-edit-menu-dropdown');
    menu.innerHTML = menuTempl();
    document.body.appendChild(menu);
  });
  menu.querySelector(".mobileEditBtn").addEventListener("click", () => {
    renderEditForm(contact);
  });
  menu.querySelector(".mobileDeleteBtn").addEventListener("click", () => {
    deleteContact(contact.id);
  });
}

// zum bearbeiten eines Kontakts
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

// zum löschen eines Kontakts
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

// zum leeren der Eingabefelder im Modal 
function cancelContac() {
  let firstname = document.getElementById('firstname');
  let lastname = document.getElementById('lastname');
  let email = document.getElementById('email');

  firstname.value ='';
  lastname.value ='';
  email.value ='';
};