
const baseURL = "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
const displayContactList = document.getElementById("contactListContent");
let contactList = [];

async function loadContacts() {
    const response = await fetch(baseURL);
    const data = await response.json();

    contactList = Object.values(data);
    displayContactList.innerHTML = "";
    console.log(data)
   contactList.forEach(contact => {
       const contactElement = document.createElement("li");
       contactElement.innerHTML = `
        <div class="contactElement" onclick="showContactCard(${contact.id})">
           <p>${contact.firstname} ${contact.lastname}</p>
           <p class="mailStyle">${contact.email}</p>
       </div>
       `;
       displayContactList.appendChild(contactElement);
   });
}

async function showContactCard(id) {
    const response = await fetch(baseURL + `/${id}.json`);
    const data = await response.json();

    const contact = contactList.find(c => c.id === data.id);
    console.log(contact)
    if (contact) {
        const displayCard = document.querySelector(".displayContactCard");
        displayCard.innerHTML = `
            <h2>${contact.firstname} ${contact.lastname}</h2>
            <p class="mailStyle">${contact.email}</p>
        `;
    }
}