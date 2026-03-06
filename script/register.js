/**
 * @typedef {Object} UserData
 * @property {number} id - The unique user ID
 * @property {string} name - The user's name
 * @property {string} email - The user's email address
 * @property {string} password - The user's password
 */

/** @type {HTMLInputElement} */
let username = document.getElementById("username");
/** @type {HTMLInputElement} */
let email = document.getElementById("email");
/** @type {HTMLInputElement} */
let password = document.getElementById("password");
/** @type {HTMLInputElement} */
let confirmPassword = document.getElementById("confirmepsw");
/** @type {HTMLInputElement} */
let checkbox = document.querySelector(".checkbox");

/**
 * Validates the entire form
 * @returns {boolean} True if all validations pass, false otherwise
 */
function validateForm() {
  clearErrors();

  const validations = [
    validateUsername(),
    validateEmail(),
    validatePassword(),
    validatePasswordConfirmation(),
    validatePrivacyPolicy()
  ];

  return validations.every(result => result === true);
}

/**
 * Validates the username field
 * @returns {boolean} True if username is valid, false otherwise
 */
function validateUsername() {
  if (!username.value.trim()) {
    setError("username", " * Please enter your name.");
    return false;
  }
  return true;
}

/**
 * Validates the email field
 * @returns {boolean} True if email is valid, false otherwise
 */
function validateEmail() {
  const emailValue = email.value.trim();

  if (!emailValue) {
    setError("email", "* please enter your email.");
    return false;
  }

  if (!isValidEmail(emailValue)) {
    setError("email", " * Invalid email address.");
    return false;
  }

  return true;
}

/**
 * Validates the password field
 * @returns {boolean} True if password is valid, false otherwise
 */
function validatePassword() {
  const passwordValue = password.value.trim();

  if (!passwordValue) {
    setError("password", "* please enter your password.");
    return false;
  }

  if (passwordValue.length < 6) {
    setError("password", "* at least 6 characters.");
    return false;
  }

  return true;
}

/**
 * Validates the password confirmation field
 * @returns {boolean} True if passwords match, false otherwise
 */
function validatePasswordConfirmation() {
  const confirmValue = confirmPassword.value.trim();

  if (!confirmValue) {
    setError("confirmepsw", "* please confirm your password.");
    return false;
  }

  if (password.value !== confirmPassword.value) {
    setError("confirmepsw", "* password do not match, please try again!");
    return false;
  }

  return true;
}

/**
 * Validates if the privacy policy checkbox is checked
 * @returns {boolean} True if checkbox is checked, false otherwise
 */
function validatePrivacyPolicy() {
  if (!checkbox.checked) {
    document.getElementById("error-privacy");
    return false;
  }
  return true;
}

/**
 * Sets an error message for a specific field
 * @param {string} fieldId - The ID of the input field
 * @param {string} message - The error message to display
 */
function setError(fieldId, message) {
  /** @type {HTMLInputElement} */
  let input = document.getElementById(fieldId);
  /** @type {HTMLElement} */
  let errorDiv = document.getElementById("error-" + fieldId);

  if (input) input.classList.add("input-error");
  if (errorDiv) errorDiv.innerText = message;
}

/**
 * Clears all error messages and error classes
 */
function clearErrors() {
  document.querySelectorAll(".error-message").forEach((el) => {
    el.innerText = "";
  });

  document.querySelectorAll("input").forEach((input) => {
    input.classList.remove("input-error");
  });
}

/**
 * Checks if an email address is valid
 * @param {string} email - The email address to validate
 * @returns {boolean} True if email is valid, false otherwise
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Adds a new user to the system
 * @async
 * @returns {Promise<void>}
 */
async function addUser() {
  if (!validateForm()) return;

  const userData = collectUserFormData();

  try {
    await saveUserToDatabase(userData);
    showSuccessMessageAndRedirectToLogin();
  } catch (error) {
    handleUserSaveError(error);
  }
}

/**
 * Collects form data for a new user
 * @returns {UserData} The collected user data
 */
function collectUserFormData() {
  const userId = generateUserId();

  return {
    id: userId,
    name: username.value.trim(),
    email: email.value.trim(),
    password: password.value.trim()
  };
}

/**
 * Generates a unique user ID
 * @returns {number} The generated ID (current timestamp)
 */
function generateUserId() {
  return Date.now();
}

/**
 * Saves user data to the database
 * @async
 * @param {UserData} userData - The user data to save
 * @returns {Promise<Response>} The fetch response
 * @throws {Error} If registration fails
 */
async function saveUserToDatabase(userData) {
  const response = await fetch(`${BASE_URL}/${userData.id}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return response;
}

/**
 * Shows success message and redirects to login page
 */
function showSuccessMessageAndRedirectToLogin() {
  showSuccessOverlay();
  setTimeout(redirectToLoginPage, 1200);
}

/**
 * Displays the success overlay
 */
function showSuccessOverlay() {
  /** @type {HTMLElement} */
  const overlay = document.getElementById("successOverlay");
  overlay.style.display = "flex";
}

/**
 * Redirects to the login page
 */
function redirectToLoginPage() {
  window.location.href = "../index.html";
}

/**
 * Handles errors that occur during user save operation
 * @param {Error} error - The error that occurred
 */
function handleUserSaveError(error) {
  console.error("Error saving the user:", error);
  alert("Registration failed. Please try again later.");
}

initInputs();

/**
 * Initializes all input fields with event listeners
 */
function initInputs() {
  /** @type {NodeListOf<HTMLElement>} */
  const groups = document.querySelectorAll(".input-group");

  groups.forEach((group) => {
    /** @type {HTMLInputElement} */
    const input = group.querySelector("input");
    /** @type {HTMLImageElement} */
    const icon = group.querySelector(".input-icon");
    /** @type {string} */
    const type = group.dataset.type;

    if (input && icon) {
      input.addEventListener("input", () => handleInput(input, icon, type));
      icon.addEventListener("click", () => handleIconClick(input, icon, type));
    }
  });
}

/**
 * Handles input events for password fields
 * @param {HTMLInputElement} input - The input field
 * @param {HTMLImageElement} icon - The icon element
 * @param {string} type - The field type (e.g., "password")
 */
function handleInput(input, icon, type) {
  if (type !== "password") return;

  if (input.value.length === 0) {
    input.type = "password";
    icon.src = icon.dataset.default;
    return;
  }

  if (input.type === "password") {
    icon.src = icon.dataset.visible;
  }
}

/**
 * Handles click events on password icons
 * @param {HTMLInputElement} input - The associated input field
 * @param {HTMLImageElement} icon - The clicked icon
 * @param {string} type - The field type (e.g., "password")
 */
function handleIconClick(input, icon, type) {
  if (type !== "password") return;
  if (input.value.length === 0) return;

  const isHidden = input.type === "password";

  input.type = isHidden ? "text" : "password";
  icon.src = isHidden ? icon.dataset.hidden : icon.dataset.visible;
}