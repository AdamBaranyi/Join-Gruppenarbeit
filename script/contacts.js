const BASE_URL = "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/";
const currentUser = getCurrentUser()?.id;
const userId = currentUser || "guest";
const url = `${BASE_URL}/contacts/${userId}.json`;


function getCurrentUser() {
  let currentUser = JSON.parse(sessionStorage.getItem("current_user"));
  console.log("current User:", currentUser )
  return currentUser;
}

async function loadContacts() {
  const response = await fetch(url);
  const data = await response.json();

  const contacts = data ? Object.values(data) : [];
  renderContacts(contacts);
}

function renderContacts(contacts) {
  const list = document.getElementById("contactListContent");
  list.innerHTML = "";

  contacts.forEach(contact => {
    list.innerHTML += `
      <div onclick="showContactDetails('${contact.id}')" class="contact-item">
        <strong>${contact.firstname} ${contact.lastname}</strong><br>
        <span class="mailStyle">${contact.email}</span>
      </div>
    `;
    console.log("contact:", contact.id);
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
      <input type="text" id="firstname" autocomplete="given-name" placeholder="First Name"  value="<img src='../assets/imgs/contacts.svg' alt='add person icon'>" required>
      <input type="text" id="lastname" autocomplete="family-name" placeholder="Last Name" required>
      <input type="email" id="email" autocomplete="email" placeholder="Email" required>
      <div class="btnContainer">
        <button onclick="cancelContac()" class="cancelBtn">Cancel X</button>
        <button onclick="addContact({ 
          firstname: document.getElementById('firstname').value,
          lastname: document.getElementById('lastname').value,
          email: document.getElementById('email').value })" class="checkBtn">Create contact <img src="../assets/imgs/check.svg" alt=""> </button>
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
    return newId;
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
  const mobileOptionsBtn = document.getElementById("mobileOptionsBtn");
  contactListContainer.classList.add("displayNone");
  sloganAndCardContainer.style.display = "flex";
  }
  
  card.innerHTML = `
      <div class="contact-item">
        <div class="contact-header">
          <img src="../assets/imgs/Ellipse 3.svg" alt="contactInitals icon">
          <strong>${contact.firstname} ${contact.lastname}</strong><br>
        </div>
        <div class="editAndDeleteBtnContainer">
          <button onclick="renderEditForm('${contact}')" class="editBtn">Edit <img src="../assets/imgs/edit.svg" alt=""></button>
          <button class="deleteBtn">Delete <img src="../assets/imgs/delete.svg" alt=""></button>
        </div>
        <span>Contact Information:</span><br>
        <div class="contact-info">
          <span>Email: <br> <span class="mailStyle">${contact.email}</span></span><br>
        </div>
      `;
};

function renderEditForm(contact) {
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
      <div class="btnContainer">
        <button onclick="cancelContac()" class="cancelBtn">Cancel X</button>
        <button class="checkBtn">Save changes <img src="../assets/imgs/check.svg" alt=""> </button>
      </div>
    </form>
  `;
}

function cancelContac() {
  let firstname = document.getElementById('firstname');
  let lastname = document.getElementById('lastname');
  let email = document.getElementById('email');

  firstname.value ='';
  lastname.value ='';
  email.value ='';
};