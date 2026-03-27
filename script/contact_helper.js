// help initialise content for card
function helpRenderContactCard(contact) {
    const card = document.getElementById("contact-card-content");
    const sloganAndCardContainer = document.getElementById("slogan-and-card-container");
    const contactListContainer = document.getElementById("contact-list-container");
    const mainContent = document.querySelector(".main-content");

    if (contactListContainer) contactListContainer.style.display = "";
    if (sloganAndCardContainer) sloganAndCardContainer.style.display = "";

    card.classList.remove("display-none");
    mainContent.classList.add("show-contact-card");
    card.innerHTML = contactCard(contact);
    showInitials(contact);
    
    const cardWrapper = document.getElementById("contact-card");
    cardWrapper.classList.remove("show");
    setTimeout(() => {cardWrapper.classList.add("show");}, 10);
}

// check for mobile render card
function checkForMobileRenderCard() {
  const card = document.getElementById("contact-card-content");
  const sloganAndCardContainer = document.getElementById("slogan-and-card-container",);
  const contactListContainer = document.getElementById("contact-list-container",);
  const closeCardBtn = document.getElementById("close-card-btn");
  const mobileSlogan = document.getElementById("mobile-slogan");
  if (window.innerWidth <= 850) {
    mobileSlogan.classList.remove("display-none");
    card.classList.remove("display-none");
    closeCardBtn.classList.remove("display-none");
    contactListContainer.style.display = "none";
    sloganAndCardContainer.style.display = "flex";
  } else {
    mobileSlogan.classList.add("display-none");
    card.classList.remove("display-none");
    closeCardBtn.classList.add("display-none");
    contactListContainer.style.display = "flex";
  }
}

// Ensure ESC key triggers the smooth CSS close animation
document.addEventListener("DOMContentLoaded", () => {
    const dialogModal = document.getElementById("dialog-modal");
    if (dialogModal) {
        dialogModal.addEventListener("cancel", (e) => {
            e.preventDefault();
            closeModal();
        });
    }
});

//help functions for validation 
function checkFirstname(data, formType) {
  let isValid;
  if (!data.firstname) {
        setError(formType === 'add' ? 'add-firstname' : 'edit-firstname', '* First name is required');
        isValid = false;
    } else if (data.firstname.length < 2) {
        setError(formType === 'add' ? 'add-firstname' : 'edit-firstname', '* First name must be at least 2 characters');
        isValid = false;
    } else {isValid = true}
    return isValid;
}

function checkLastname(data, formType) {
  let isValid;
  if (!data.lastname) {
        setError(formType === 'add' ? 'add-lastname' : 'edit-lastname', '* Last name is required');
        isValid = false;
    } else if (data.lastname.length < 2) {
        setError(formType === 'add' ? 'add-lastname' : 'edit-lastname', '* Last name must be at least 2 characters');
        isValid = false;
    } else {isValid = true}
    return isValid;
}

function checkMail(data, formType) {
  let isValid;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email) {
        setError(formType === 'add' ? 'add-email' : 'edit-email', '* Email is required');
        isValid = false;
    } else if (!emailRegex.test(data.email)) {
        setError(formType === 'add' ? 'add-email' : 'edit-email', '* Please enter a valid email address');
        isValid = false;
    } else {isValid = true}
    return isValid;
}

// save a new contact to the database
async function putContactInBackend(newId, contactWithId) {
  await fetch(`${BASE_URL}/contacts/${newId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactWithId),
  });
}

//help function for loading contact details
async function showContactDetails(contactId) {
  const response = await fetch(url);
  const data = await response.json();

  if (!data) return;

  const contact = data[contactId];
  renderContactCard(contact);
}

// help function for error styling
function markAsError() {
  const firstnameError = document.getElementById('firstname')
  const lastnameError = document.getElementById('lastname')
  const mailError = document.getElementById('email')
  const firstnameErrorMsg = document.getElementById('error-firstname')
  const lastnameErrorMsg = document.getElementById('error-lastname')
  const mailErrorMsg = document.getElementById('error-mail-adress')

    firstnameError.classList.add('error')
    firstnameErrorMsg.classList.remove('display-none')

    lastnameError.classList.add('error')
    lastnameErrorMsg.classList.remove('display-none')

    mailError.classList.add('error')
    mailErrorMsg.classList.remove('display-none')
    return
}

// help functions to get data from form
function getAddFormData(){
    return {
        firstname: document.getElementById("add-firstname").value.trim(),
        lastname: document.getElementById("add-lastname").value.trim(),
        email: document.getElementById("add-email").value.trim(),
        phonenumber: document.getElementById("add-phone").value.trim()
    };

}

function getEditFormData(){
    return {
        firstname: document.getElementById("edit-firstname").value.trim(),
        lastname: document.getElementById("edit-lastname").value.trim(),
        email: document.getElementById("edit-email").value.trim(),
        phonenumber: document.getElementById("edit-phone").value.trim()
    };

}

function fillEditForm(contact) {
    const form = document.getElementById("edit-contact-form");
    form.dataset.id = contact.id;
    document.getElementById("edit-firstname").value = contact.firstname;
    document.getElementById("edit-lastname").value = contact.lastname;
    document.getElementById("edit-email").value = contact.email;
    document.getElementById("edit-phone").value = contact.phonenumber;
}