function renderContactListItem(contact, initials, bgColor) {
  return `
    <div class="contact-row" onclick='renderContactCard(${JSON.stringify(contact)}); this.parentElement.querySelectorAll(".contact-row").forEach(row => row.classList.remove("active")); this.classList.add("active");'>
      <div class="contact-list-item">
        <div class="contact-circle" style="background:${bgColor}">
          ${initials.toUpperCase()}
        </div>
        <div>
          ${contact.firstname} ${contact.lastname}<br>
          <span class="mail-style">${contact.email}</span>
        </div>
      </div>
    </div>
  `;
}

function openModalLeftSide() {
  return `
        <img class="logo-white" src="../assets/imgs/logo_white.svg" alt="">
        <h3>Add contact</h3>
        <span>Tasks are better with a team!</span>
        <img class="vector-horizontel" src="../assets/imgs/Vector horizontel.png" alt="">
    `;
}

function openModalRightSide() {
  return `
        <form method="dialog" id="contact-form" onsubmit="addContact({ 
            firstname: document.getElementById('firstname').value,
            lastname: document.getElementById('lastname').value,
            email: document.getElementById('email').value,
            phonenumber: document.getElementById('phonenumber').value
            })">
        <div class="input-group" data-type="text">
            <input type="text" id="firstname" autocomplete="given-name" placeholder="First Name" required>
            <img class="input-icon" src="..//assets/imgs/person.svg" alt="PrsonIcon">
        </div>
        <div class="input-group" data-type="text">
            <input type="text" id="lastname" autocomplete="family-name" placeholder="Last Name" required>
            <img class="input-icon" src="..//assets/imgs/person.svg" alt="PrsonIcon">
        </div>
        <div class="input-group" data-type="email">
            <input type="email" id="email" autocomplete="email" placeholder="Email" required>
            <img class="input-icon" src="..//assets/imgs/mail.svg" alt="mailIcon">
        </div>
        <div class="input-group" data-type="tel">
            <input type="text" id="phonenumber" autocomplete="tel" placeholder="Phone Number">
            <img class="input-icon" src="..//assets/imgs/call.png" alt="phoneIcon">
        </div>

        <div class="btn-container">
            <button type="button" onclick="cancelContact()" class="clear-btn">      
            <p class="btn-text">Cancel</p>
            <img src="../assets/imgs/iconoir_cancel.svg" class="btn-icon close-icon" alt="Cancel"></button>

            <button type="submit" class="create-btn">      
            <p class="btn-text">Create Contact</p>
            <img src="../assets/imgs/check.svg" class="btn-icon create-icon" alt="Check" />
            </button>

        </div>
        </form>
    `;
}

function contactCard(contact) {
  return `
        <div class="contact-item">
            <div class="contact-header">
            <div id="contact-initials" class="contact-initials">
            </div>
            <div class="btn-and-name-container">
                <div class="contact-name">${contact.firstname} ${contact.lastname}</div>
                <div class="edit-and-delete-btn-container">
                    <button class="action-btn edit-btn"><img src="../assets/imgs/edit.svg" alt="Edit"> Edit</button>
                    <button class="action-btn delete-btn"><img src="../assets/imgs/delete.svg" alt="Delete"> Delete</button>
                </div>
            </div>
            </div>
            <div class="contact-info-header">Contact Information:</div>
            <div class="contact-info">
            <strong>Email:</strong> <span class="mail-style">${contact.email}</span>
            <strong>Phone Number:</strong> <span>${contact.phonenumber}</span>
            </div>
            <div class="mobile-edit-container">
                <img onclick='mobileEditMenu(${JSON.stringify(contact)}, event)' id="mobile-option-menu" class="mobile-edit-menu" src="../assets/imgs/Menu Contact options.png" alt="contact options menu">
                <div class="display-none" id="mobile-menu"></div>
            </div>
        </div>
    `;
}

function editFormleftSide() {
  return `
        <img class="logo-white" src="../assets/imgs/logo_white.svg" alt="Logo White">
        <h3>Edit contact</h3>
        <img class="vector-horizontel" src="../assets/imgs/Vector horizontel.png" alt="">
  `;
}

function editFormRightSide(contact) {
  return `
        <form method="dialog" id="contact-form" onsubmit="editContact('${contact.id}')">
            <div class="input-group" data-type="text">
                <input type="text" id="firstname" autocomplete="given-name" placeholder="First Name" value="${contact.firstname}" required>
                <img class="input-icon" src="..//assets/imgs/person.svg" alt="PrsonIcon">
            </div>
            <div class="input-group" data-type="text">
                <input type="text" id="lastname" autocomplete="family-name" placeholder="Last Name" value="${contact.lastname}" required>
                <img class="input-icon" src="..//assets/imgs/person.svg" alt="PrsonIcon">
            </div>
            <div class="input-group" data-type="email">
                <input type="email" id="email" autocomplete="email" placeholder="Email" value="${contact.email}" required>
                <img class="input-icon" src="..//assets/imgs/mail.svg" alt="mailIcon">
            </div>
            <div class="input-group" data-type="tel">
                <input type="text" id="phonenumber" autocomplete="tel" placeholder="Phone Number" value="${contact.phonenumber}">
                <img class="input-icon" src="..//assets/imgs/call.png" alt="phoneIcon">
            </div>
            <div class="btn-container">
                <button onclick="deleteContact('${contact.id}')" class="delete-btn-modal">Delete X</button>
                <input type="submit" class="check-btn" value="Save">
            </div>
        </form>
  `;
}

function menuTempl(contact) {
  return `
      <div class="mobile-menu">
          <button class="mobile-edit-btn"><img class="mobile-edit-icon" src="../assets/imgs/edit.png" alt="edit icon">Edit</button>
          <button onclick="deleteContact('${contact.id}')" class="mobile-delete-btn"><img class="mobile-edit-icon" src="../assets/imgs/delete.png" alt="delete icon"> Delete</button>
      </div>
    `;
}
