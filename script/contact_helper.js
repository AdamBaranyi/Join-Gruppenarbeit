
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