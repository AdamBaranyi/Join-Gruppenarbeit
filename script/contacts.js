
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
        <div>
           <p>${contact.firstname} ${contact.lastname}</p>
           <p>${contact.email}</p>
       </div>
       `;
       displayContactList.appendChild(contactElement);
   });
}