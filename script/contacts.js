const BASE_URL = "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/";


function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem("current_user"));
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
        <span>${contact.email}</span>
      </div>
    `;
  });
}

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