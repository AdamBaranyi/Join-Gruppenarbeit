/**
 * Form validation functions for contacts.
 */

/**
 * Sets an error message for a specific input field.
 * @param {string} inputId - The ID of the input element.
 * @param {string} message - The error message to display.
 */
function setError(inputId, message) {
    const inputGroup = document.getElementById(inputId).closest('.input-group');
    const existingError = inputGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    inputGroup.classList.add('error');
    const errorSpan = document.createElement('span');
    errorSpan.className = 'error-message';
    errorSpan.textContent = message;
    inputGroup.appendChild(errorSpan);
}

/**
 * Clears the error message from a specific input field.
 * @param {string} inputId - The ID of the input element.
 */
function clearError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const inputGroup = input.closest('.input-group');
    if (!inputGroup) return;
    inputGroup.classList.remove('error');
    const existingError = inputGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

/**
 * Clears all error messages from the form.
 * @param {string} formType - The form type ('add' or 'edit').
 */
function clearAllErrors(formType) {
    const fields = formType === 'add'
        ? ['add-firstname', 'add-lastname', 'add-email', 'add-phone']
        : ['edit-firstname', 'edit-lastname', 'edit-email', 'edit-phone'];

    fields.forEach(id => {
        if (document.getElementById(id)) {
            clearError(id);
        }
    });
}

/**
 * Validates all fields in the contact form.
 * @param {Object} data - The contact data to validate.
 * @param {string} formType - The form type ('add' or 'edit').
 * @returns {boolean} True if all fields are valid, false otherwise.
 */
function validateContact(data, formType) {
  let allValid;
  clearAllErrors(formType);
  const firstnameValid = checkFirstname(data, formType);
  const lastnameValid = checkLastname(data, formType);
  const mailValid = checkMail(data, formType);
  const phoneValid = checkPhone(data, formType);

  if (firstnameValid && lastnameValid && mailValid && phoneValid) {
    allValid = true
  }
  else {allValid = false}
  return allValid;
}

/**
 * Adds real-time input validation listeners to form fields.
 */
function addInputValidationListeners() {
    const addInputs = ['add-firstname', 'add-lastname', 'add-email', 'add-phone'];
    addInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.removeEventListener('input', handleInputValidation);
            input.addEventListener('input', handleInputValidation);
        }
    });
    const editInputs = ['edit-firstname', 'edit-lastname', 'edit-email', 'edit-phone'];
    editInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.removeEventListener('input', handleInputValidation);
            input.addEventListener('input', handleInputValidation);
        }});
}

/**
 * Handles real-time input validation as the user types.
 * @param {Event} e - The input event.
 */
function handleInputValidation(e) {
    const input = e.target;
    const inputId = input.id;
    const formType = inputId.startsWith('add-') ? 'add' : 'edit';
    clearError(inputId);
    const value = input.value.trim();
    if (inputId.includes('firstname') && value.length === 1) {return;}
    if (inputId.includes('lastname') && value.length === 1) {return;}
    if (inputId.includes('email') && value.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value) && value.length > 5) {setError(inputId, '* Please enter a valid email address');}}
    if (inputId.includes('phone') && value.length > 0 && value.length < 6) {setError(inputId, '* Phone number must be at least 6 digits');}
}
