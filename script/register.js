const BASE_URL =
  "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/users";

async function addUser() {
  let name = document.getElementById("username");
  let email = document.getElementById("email");
  let password = document.getElementById("password");
  let confirmPassword = document.getElementById("confirmepsw");

  if (password.value !== confirmPassword.value) {
    alert("Die Passwörter stimmen nicht überein!");
    return;
  }

  let newUser = {
    name: name.value,
    email: email.value,
    password: password.value,
  };

  try {
    let response = await fetch(BASE_URL + ".json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    });

    if (response.ok) {
      window.location.href =
        "../index.html?msg=Deine Registrierung war erfolgreich";
    } else {
      console.error("Fehler beim Speichern:", response.statusText);
      alert("Fehler bei der Registrierung.");
    }
  } catch (error) {
    console.error("Netzwerkfehler:", error);
    alert("Es gab einen Netzwerkfehler.");
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
