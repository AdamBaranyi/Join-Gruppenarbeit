function renderContactListItem(contact, initials, bgColor) {
    return `
    <div class="contactRow" onclick='renderContactCard(${JSON.stringify(contact)}); this.parentElement.querySelectorAll(".contactRow").forEach(row => row.classList.remove("active")); this.classList.add("active");'>
      <div class="contactItem">
        <div class="contactCircle" style="background:${bgColor}">
          ${initials.toUpperCase()}
        </div>
        <div>
          ${contact.firstname} ${contact.lastname}<br>
          <span class="mailStyle">${contact.email}</span>
        </div>
      </div>
    </div>
  `;
}

function openModalLeftSide() {
    return `
        <img class="logoWhite" src="../assets/imgs/logo_white.svg" alt="">
        <h3>Add contact</h3>
        <span>Tasks are better with a team!</span>
        <img class="vectorHorizontel" src="../assets/imgs/Vector horizontel.png" alt="">
    `;
}

function openModalRightSide() {
    return `
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
}

function contactCard(contact) {
    return `
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
            <img onclick='mobileEditMenu(${JSON.stringify(contact)}, event)' id="mobileOptionMenu" class="mobileEditMenu" src="../assets/imgs/Menu Contact options.png" alt="contact options menu">
            <div class="displayNone" id="mobileMenu"></div>
        </div>
    `;
}

function editFormleftSide() {
    return `
        <img class="logoWhite" src="../assets/imgs/logo_white.svg" alt="Logo White">
        <h3>Edit contact</h3>
        <img class="vectorHorizontel" src="../assets/imgs/Vector horizontel.png" alt="">
  `;
}

function editFormRightSide(contact) {
    return `
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
}

function menuTempl(contact) {
    return `
      <div class="mobileMenu">
          <button onclick="editContact('${contact.id}')" class="mobileEditBtn">Edit</button>
          <button onclick="deleteContact('${contact.id}')" class="mobileDeleteBtn">Delete</button>
      </div>
    `;
}