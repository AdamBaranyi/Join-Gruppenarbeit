const BASE_URL =
  "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/users";

let email = document.getElementById("email");
let password = document.getElementById("password");
let confirmPassword = document.getElementById("confirmepsw");
let singnupConfirmation = document.getElementById("singnup-confirmation");

async function addUser() {
  let name = document.getElementById("username");

  if (password.value !== confirmPassword.value) {
    alert("Die Passwörter stimmen nicht überein!");
    return;
  }

  let userId = Date.now();

  let newUser = {
    id: userId,
    name: name.value,
    email: email.value,
    password: password.value,
  };

  try {
    let response = await fetch(`${BASE_URL}/${userId}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    });

    if (response.ok) {
      document.getElementById("successOverlay").style.display = "flex";

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1000);
    } else {
      alert("Fehler bei der Registrierung.");
    }
  } catch (error) {
    console.error("Es ist eine Fehler aufgetreten:", error);
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
