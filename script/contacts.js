const BASE_URL = "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/";


function getCurrentUser() {
  let currentUser = JSON.parse(sessionStorage.getItem("current_user"));
  
  console.log("Current User:", currentUser); // Debugging: Log the current user
  if (currentUser === null) {
      const sidebarGuest = document.getElementById("sidebarGuest");
      const sidebarLogedIn = document.getElementById("sidebarLogedIn");
      sidebarGuest.classList.remove("displayNone");
      sidebarLogedIn.classList.add("displayNone");
    } else if (currentUser != null) {
      const sidebarGuest = document.getElementById("sidebarGuest");
      const sidebarLogedIn = document.getElementById("sidebarLogedIn");
      sidebarGuest.classList.add("displayNone");
      sidebarLogedIn.classList.remove("displayNone");
    }
}

async function loadContacts() {
  const user = getCurrentUser();
  const userId = user ? user.id : "guest";

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

function openModal() {
  let contactWindow = document.getElementById("contactModal")
  let contactModal = document.getElementById("dialogModal")
  contactModal.classList.remove("displayNone");
  contactModal.showModal();
  contactWindow.innerHTML = `
    <form id="contactForm">
      <input type="text" id="firstname" placeholder="First Name" required>
      <input type="text" id="lastname" placeholder="Last Name" required>
      <input type="email" id="email" placeholder="Email" required>
      <button type="submit">Add Contact</button>
    </form>
  `;
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