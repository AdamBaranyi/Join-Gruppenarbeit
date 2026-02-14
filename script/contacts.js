const baseURL = "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/contacts";
const contactList = document.getElementById("contactList");

async function loadContacts() {
    const response = await fetch(`${baseURL}`);
    const data = await response.json();
    
    contactList.innerHTML = "";

    for (const id in data) {
        const contact = data[id];
        const contactElement = document.createElement("div");
        contactElement.classList.add("contact");
        contactElement.innerHTML = `
            <p>Name: ${contact.name}</p>
            <p>Email: ${contact.email}</p>
        `;
        contactList.innerHTML += contactElement.outerHTML;
    }
}