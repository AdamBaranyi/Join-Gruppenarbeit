/**
 * Event listeners for the contacts page.
 */

/**
 * Initialize validation listeners when DOM is loaded.
 */
document.addEventListener('DOMContentLoaded', function() {
    addInputValidationListeners();
});

/**
 * Handle add contact form submission.
 */
document.addEventListener("submit", function(e) {
    if (e.target.id === "add-contact-form") {
        e.preventDefault();
        const data = getAddFormData();

        if (!validateContact(data, 'add')) {return}
          else {
            addContact(data);
          };
    }
});

/**
 * Handle edit contact form submission.
 */
document.addEventListener("submit", function(e) {
    if (e.target.id === "edit-contact-form") {
        e.preventDefault();
        const id = e.target.dataset.id;
        const data = getEditFormData();

        if (!validateContact(data, 'edit')) {return}
          else {
            editContact(id, data);
          };

    }
});

/**
 * Handle delete contact button click.
 */
document.addEventListener("click", function(e) {
    if (e.target.id === "delete-contact") {
        const form = document.getElementById("edit-contact-form");
        const id = form.dataset.id;
        closeModal()
        deleteContact(id);
    }
});

/**
 * Handle cancel button and outside clicks for mobile menu.
 */
document.addEventListener("click", function(e) {
    if (e.target.id === "cancel-add") {
        e.preventDefault();
        closeModal();
    }

    // Close mobile edit/delete menu when clicking outside
    let menu = document.getElementById("mobile-menu");
    let editContainer = document.querySelector(".mobile-edit-container");
    if (menu && !menu.classList.contains("display-none")) {
        if (!menu.contains(e.target) && (!editContainer || !editContainer.contains(e.target))) {
            menu.classList.add("display-none");
            menu.classList.remove("mobile-menu");
        }
    }
});
