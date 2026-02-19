const BASE_URL = "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/";


function getCurrentUser() {
  let currentUser = JSON.parse(sessionStorage.getItem("current_user"));
  console.log("current User:", currentUser )
  return currentUser;
}

async function loadContacts() {
  const user = getCurrentUser();
  const userId = user?.id || "guest";

  const url = `${BASE_URL}/contacts/${userId}.json`;
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
      <div class="contact-item">
        <strong>${contact.firstname} ${contact.lastname}</strong><br>
        <span class="mailStyle">${contact.email}</span>
      </div>
    `;
  });
}

const contactWindow = document.getElementById("contactModal")
const contactModal = document.getElementById("dialogModal")

function openModal() {
  contactModal.showModal();
  contactWindow.innerHTML = `
    <form method="dialog" id="contactForm">
      <input type="text" id="firstname" autocomplete="given-name" placeholder="First Name" required>
      <input type="text" id="lastname" autocomplete="family-name" placeholder="Last Name" required>
      <input type="email" id="email" autocomplete="email" placeholder="Email" required>
      <div class="btnContainer">
        <button class="cancelBtn">Cancel X</button>
        <button class="checkBtn">Create contact <img src="../assets/imgs/check.svg" alt=""> </button>
      </div>
    </form>
  `;
};

function closeModal() {
  contactModal.close();
};
  

async function addContact(contactData) {
    const userId = currentUser || "guest";
    const url = `${BASE_URL}/contacts/${userId}.json`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData)
    });

    const result = await res.json();
    return result.name; // generierte Firebase-ID
}