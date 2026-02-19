const BASE_URL =
  "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/users";

let username = document.getElementById("username");
let email = document.getElementById("email");
let password = document.getElementById("password");
let confirmPassword = document.getElementById("confirmepsw");
let checkbox = document.querySelector(".checkbox");

function validateForm() {
  clearErrors();
  let isValid = true;

  if (!username.value.trim()) {
    setError("username", " * Please enter your name.");
    isValid = false;
  }

  if (!email.value.trim()) {
    setError("email", "* please enter your email.");
    isValid = false;
  } else if (!isValidEmail(email.value.trim())) {
    setError("email", " * Invalid email address.");
    isValid = false;
  }

  if (!password.value.trim()) {
    setError("password", "* please enter your password.");
    isValid = false;
  } else if (password.value.length < 6) {
    setError("password", "* at least 6 characters.");
    isValid = false;
  }

  if (!confirmPassword.value.trim()) {
    setError("confirmepsw", "* please confirm your password.");
    isValid = false;
  } else if (password.value !== confirmPassword.value) {
    setError("confirmepsw", "* password do not match, please try again!");
    isValid = false;
  }

  if (!checkbox.checked) {
    document.getElementById("error-privacy").innerText;
    isValid = false;
  }

  return isValid;
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

  let userId = Date.now();

  let newUser = {
    id: userId,
    name: username.value.trim(),
    email: email.value.trim(),
    password: password.value.trim(),
  };

  try {
    let response = await fetch(`${BASE_URL}/${userId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (response.ok) {
      document.getElementById("successOverlay").style.display = "flex";

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1200);
    } else {
      alert("Fehler bei der Registrierung.");
    }
  } catch (error) {
    console.error("Fehler:", error);
  }
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
