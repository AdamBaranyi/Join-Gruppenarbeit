const BASE_URL =
  "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/users";

let username = document.getElementById("username");
let email = document.getElementById("email");
let password = document.getElementById("password");
let confirmPassword = document.getElementById("confirmepsw");
let checkbox = document.querySelector(".checkbox");

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

function validateUsername() {
  if (!username.value.trim()) {
    setError("username", " * Please enter your name.");
    return false;
  }
  return true;
}

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

function validatePrivacyPolicy() {
  if (!checkbox.checked) {
    document.getElementById("error-privacy").innerText = "* Please accept the privacy policy";
    return false;
  }
  return true;
}

function setError(fieldId, message) {
  let input = document.getElementById(fieldId);
  let errorDiv = document.getElementById("error-" + fieldId);

  if (input) input.classList.add("input-error");
  if (errorDiv) errorDiv.innerText = message;
}

function clearErrors() {
  document.querySelectorAll(".error-message").forEach((el) => {
    el.innerText = "";
  });

  document.querySelectorAll("input").forEach((input) => {
    input.classList.remove("input-error");
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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

function collectUserFormData() {
  const userId = generateUserId();

  return {
    id: userId,
    name: username.value.trim(),
    email: email.value.trim(),
    password: password.value.trim()
  };
}

function generateUserId() {
  return Date.now();
}

async function saveUserToDatabase(userData) {
  const response = await fetch(`${BASE_URL}/${userData.id}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    throw new Error("Fehler bei der Registrierung");
  }

  return response;
}

function showSuccessMessageAndRedirectToLogin() {
  showSuccessOverlay();
  setTimeout(redirectToLoginPage, 1200);
}

function showSuccessOverlay() {
  document.getElementById("successOverlay").style.display = "flex";
}

function redirectToLoginPage() {
  window.location.href = "../index.html";
}

function handleUserSaveError(error) {
  console.error("Fehler beim Speichern des Benutzers:", error);
  alert("Fehler bei der Registrierung. Bitte versuchen Sie es später erneut.");
}

initInputs();

function initInputs() {
  const groups = document.querySelectorAll(".input-group");

  groups.forEach((group) => {
    const input = group.querySelector("input");
    const icon = group.querySelector(".input-icon");
    const type = group.dataset.type;

    if (input && icon) {
      input.addEventListener("input", () => handleInput(input, icon, type));
      icon.addEventListener("click", () => handleIconClick(input, icon, type));
    }
  });
}

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

function handleIconClick(input, icon, type) {
  if (type !== "password") return;
  if (input.value.length === 0) return;

  const isHidden = input.type === "password";

  input.type = isHidden ? "text" : "password";
  icon.src = isHidden ? icon.dataset.hidden : icon.dataset.visible;
}
