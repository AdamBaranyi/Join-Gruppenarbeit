const BASE_URL = "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/";
const currentUser = getCurrentUser()?.id;
const userId = currentUser || "guest";
const url = `${BASE_URL}/contacts/${userId}.json`;


function getCurrentUser() {
  let currentUser = JSON.parse(sessionStorage.getItem("current_user"));
  console.log("current User:", currentUser )
  return currentUser;
}

function sortContactsByFirstname(contacts) {
  return [...contacts].sort((a, b) =>
    a.firstname.localeCompare(b.firstname, "de", { sensitivity: "base" })
  );
}

function groupContactsByLetter(contacts) {
  const groups = {};

  contacts.forEach(contact => {
    const letter = contact.firstname.charAt(0).toUpperCase();

    if (!groups[letter]) {
      groups[letter] = [];
    }

    groups[letter].push(contact);
  });

  return groups;
}

async function loadContacts() {
  const response = await fetch(url);
  const data = await response.json();

  const contacts = data ? Object.values(data) : [];
  renderContactList(contacts);
}

function renderContactList(contacts) {

  const container = document.getElementById("contactListContent");

  container.innerHTML = "";

  const sorted = sortContactsByFirstname(contacts);
  const groups = groupContactsByLetter(sorted);

  Object.keys(groups).sort().forEach(letter => {

    container.innerHTML += `
      <div class="letterHeader">${letter}</div>
    `;

    groups[letter].forEach(contact => {

      container.innerHTML += `
        <div class="contactRow" onclick='renderContactCard(${JSON.stringify(contact)})'>
          ${contact.firstname} ${contact.lastname} <br>
          <span class="mailStyle">${contact.email}</span>
        </div>
      `;

    });

  });

}

let leftSide = document.getElementById('leftSideModal');
const contactWindow = document.getElementById("contactModal")
const contactModal = document.getElementById("dialogModal")

function openModal() {
  contactModal.showModal();

  leftSide.innerHTML = `
    <img class="logoWhite" src="../assets/imgs/logo_white.svg" alt="">
    <h3>Add contact</h3>
    <span>Tasks are better with a team!</span>
    <img class="vectorHorizontel" src="../assets/imgs/Vector horizontel.png" alt="">
  `;
  contactWindow.innerHTML = `
    <form method="dialog" id="contactForm">
      <input type="text" id="firstname" autocomplete="given-name" placeholder="First Name" required>
      <input type="text" id="lastname" autocomplete="family-name" placeholder="Last Name" required>
      <input type="email" id="email" autocomplete="email" placeholder="Email" required>
      <input type="text" id="phonenumber" autocomplete="tel" placeholder="Phone Number">
      <div class="btnContainer">
        <button onclick="cancelContac()" class="cancelBtn">Cancel X</button>
        <button onclick="addContact({ 
          firstname: document.getElementById('firstname').value,
          lastname: document.getElementById('lastname').value,
          email: document.getElementById('email').value,
          phonenumber: document.getElementById('phonenumber').value
        })" class="checkBtn">Create contact <img src="../assets/imgs/check.svg" alt=""> </button>
      </div>
    </form>
  `;
};

function closeModal() {
  contactModal.close();
};
  

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

      await fetch(`${BASE_URL}/contacts/${userId}/${newId}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactWithId)
      });
      await loadContacts();
      await showSuccessMessage();
      return newId;
  }else {
    return;
  }
};

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

function renderContactCard(contact) {
  const card = document.getElementById("contactCardContent");
  if (screen.width <= 850){
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
  console.log("contact:", contact);
  
  card.innerHTML = `
      <div class="contact-item">
        
        <div class="contact-header">
          <div id="contactInitials" class="contact-initials">
          </div>
          <strong>${contact.firstname} ${contact.lastname}</strong><br>
        </div>
        <div class="editAndDeleteBtnContainer">
          <button class="editBtn">Edit <img src="../assets/imgs/edit (1).png" alt=""></button>
          <button class="deleteBtn">Delete <img src="../assets/imgs/delete.svg" alt=""></button>
        </div>
        <span>Contact Information:</span><br>
        <div class="contact-info">
          <strong>Email:</strong> <br> <span class="mailStyle">${contact.email}</span><br>
          <strong>Phone Number:</strong> <span>${contact.phone}</span>
          </div>
        <img class="mobileEditMenu" id="mobileOptionsBtn" src="../assets/imgs/Menu Contact options.png" alt="contact options menu" onclick="mobileEditMenu()">
      `;

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

function showInitials(contact) {
  const card = document.getElementById("contactCardContent");
  let initialsElement = card.querySelector('.contact-initials');
      if (initialsElement) { 
        console.log("contact name:", contact.firstname, contact.lastname);
        let nameParts = contact.firstname.split(' ') || contact.lastname.split(' ');
        console.log("nameParts:", nameParts);
        let initials = nameParts[0].charAt(0);
        initialsElement.textContent = initials.toUpperCase();
    }
}


function closeContactCard() {
  const card = document.getElementById("contactCardContent");
  if (screen.width <= 850){
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

function renderEditForm(contact) {
  console.log(contact);
  openModal();
  leftSide.innerHTML = `
    <img class="logoWhite" src="../assets/imgs/logo_white.svg" alt="Logo White">
    <h3>Edit contact</h3>
    <img class="vectorHorizontel" src="../assets/imgs/Vector horizontel.png" alt="">
  `;
  contactWindow.innerHTML = `
    <form method="dialog" id="contactForm">
      <input type="text" id="firstname" autocomplete="given-name" placeholder="First Name" value="${contact.firstname}" required>
      <input type="text" id="lastname" autocomplete="family-name" placeholder="Last Name" value="${contact.lastname}" required>
      <input type="email" id="email" autocomplete="email" placeholder="Email" value="${contact.email}" required>
      <input type="text" id="phonenumber" autocomplete="tel" placeholder="Phone Number" value="${contact.phone}">

      <div class="btnContainer">
        <button onclick="deleteContact('${contact.id}')" class="deleteBtn">Delete X</button>
        <button onclick="editContact('${contact.id}')" class="checkBtn">Save changes <img src="../assets/imgs/check.svg" alt="check symbol"> </button>
      </div>
    </form>
  `;
  const contactImg = document.getElementById("contactImg");
  contactImg.src = '';
  contactImg.classList.add("contact-initials")
  showInitials(contact);
}

function mobileEditMenu(contact) {
  let menu = document.createElement('div');
  const mobileOptionsBtn = document.getElementById('mobileOptionsBtn');
  mobileOptionsBtn.addEventListener('click', () => {
    menu.classList.add('mobile-edit-menu-dropdown');
    menu.innerHTML = `
      <button class="mobileEditBtn">Edit</button>
      <button class="mobileDeleteBtn">Delete</button>
    `;
    document.body.appendChild(menu);
  });
  menu.querySelector(".mobileEditBtn").addEventListener("click", () => {
    renderEditForm(contact);
  });
  menu.querySelector(".mobileDelteBtn").addEventListener("click", () => {
    deleteContact(contact.id);
  });
}

async function editContact(contactId) {
  const firstname = document.getElementById('firstname').value;
  const lastname = document.getElementById('lastname').value;
  const email = document.getElementById('email').value;

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

async function deleteContact(contactId) {
  await fetch(`${BASE_URL}/contacts/${userId}/${contactId}.json`, {
    method: "DELETE"
  });

  await loadContacts();
  const card = document.getElementById("contactCardContent");
  card.innerHTML = '';
}

function cancelContac() {
  let firstname = document.getElementById('firstname');
  let lastname = document.getElementById('lastname');
  let email = document.getElementById('email');

  firstname.value ='';
  lastname.value ='';
  email.value ='';
};