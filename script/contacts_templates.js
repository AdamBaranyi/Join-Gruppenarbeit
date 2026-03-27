// template for displaying contact list items
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

// template for the left side of the dialog modal
function openModalLeftSide() {
  return `
        <img class="logo-white" src="../assets/imgs/logo_white.svg" alt="">
        <h3>Add contact</h3>
        <span>Tasks are better with a team!</span>
        <img class="vector-horizontel" src="../assets/imgs/Vector horizontel.png" alt="">
    `;
}

// template for the right side of the dialog modal with form
function openModalRightSide() {
  return `
    <form id="add-contact-form" class="contact-form">
      <div class="input-group">
        <input type="text" id="add-firstname" placeholder="First Name">
        <img class="input-icon" src="../assets/imgs/person.svg">
        <!-- Error message will be inserted here dynamically -->
      </div>

      <div class="input-group">
        <input type="text" id="add-lastname" placeholder="Last Name">
        <img class="input-icon" src="../assets/imgs/person.svg">
      </div>

      <div class="input-group">
        <input type="text" id="add-email" placeholder="Email">
        <img class="input-icon" src="../assets/imgs/mail.svg">
      </div>

      <div class="input-group">
        <input type="number" id="add-phone" placeholder="Phone Number">
        <img class="input-icon" src="../assets/imgs/call.png">
      </div>

      <div class="btn-container">
        <button type="button" id="cancel-add" class="clear-btn">Cancel</button>
        <button type="submit" class="create-btn">Create Contact
        <img src="../assets/imgs/check.svg" alt="Add Subtask" /></button>
        
      </div>
    </form>
  `;
}

// template for contact card
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
            <div class="mobile-edit-container" onclick='mobileEditMenu(${JSON.stringify(contact)}, event)'>
                <img id="mobile-option-menu" class="mobile-edit-menu" src="../assets/imgs/Menu Contact options.png" alt="contact options menu">
                <div class="display-none" id="mobile-menu"></div>
            </div>
        </div>
    `;
}

// template for left side of edit dialog modal
function editFormleftSide() {
  return `
        <img class="logo-white" src="../assets/imgs/logo_white.svg" alt="Logo White">
        <h3>Edit contact</h3>
        <img class="vector-horizontel" src="../assets/imgs/Vector horizontel.png" alt="">
  `;
}

// template for right side of edit dialog modal with form

function editFormRightSide(contact) {
  return `
    <form id="edit-contact-form" class="contact-form">
      <div class="input-group">
        <input type="text" id="edit-firstname" placeholder="First Name">
        <img class="input-icon" src="../assets/imgs/person.svg">
      </div>

      <div class="input-group">
        <input type="text" id="edit-lastname" placeholder="Last Name">
        <img class="input-icon" src="../assets/imgs/person.svg">
      </div>

      <div class="input-group">
        <input type="text" id="edit-email" placeholder="Email">
        <img class="input-icon" src="../assets/imgs/mail.svg">
      </div>

      <div class="input-group">
        <input type="number" id="edit-phone" placeholder="Phone Number">
        <img class="input-icon" src="../assets/imgs/call.png">
      </div>

      <div class="btn-container">
        <button type="button" id="delete-contact" class="delete-btn-modal">Delete</button>
        <button type="submit" class="check-btn">Save</button>
      </div>
    </form>
  `;
}

// template for mobile menu to edit and delete contacts
function menuTempl(contact) {
  return `
      <div class="mobile-menu">
          <button class="action-btn mobile-edit-btn"><img src="../assets/imgs/edit.svg" alt="edit icon"> Edit</button>
          <button class="action-btn mobile-delete-btn"><img src="../assets/imgs/delete.svg" alt="delete icon"> Delete</button>
      </div>
    `;
}
