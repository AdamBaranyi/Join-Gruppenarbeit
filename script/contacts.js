
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
           <p>Name: ${contact.firstname}</p>
           <p>Last Name: ${contact.lastname}</p>
           <p>Email: ${contact.email}</p>
       `;
       displayContactList.appendChild(contactElement);
   });
}