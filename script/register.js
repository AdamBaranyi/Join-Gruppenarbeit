const BASE_URL = "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/users";

async function addUser() {
  let name = document.getElementById("username");
  let email = document.getElementById("email");
  let password = document.getElementById("password");
  let confirmPassword = document.getElementById("confirmepsw");

  // Prüfen, ob Passwörter übereinstimmen
  if (password.value !== confirmPassword.value) {
    alert("Die Passwörter stimmen nicht überein!");
    return;
  }

  // Benutzerobjekt erstellen
  let newUser = {
    name: name.value,
    email: email.value,
    password: password.value,
  };

  try {
    // An Firebase senden (POST erstellt einen neuen Eintrag mit eindeutiger ID)
    let response = await fetch(BASE_URL + ".json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    });

    if (response.ok) {
      // Weiterleitung zum Login nach erfolgreicher Registrierung
      window.location.href = "login.html?msg=Deine Registrierung war erfolgreich";
    } else {
      console.error("Fehler beim Speichern:", response.statusText);
      alert("Fehler bei der Registrierung.");
    }

  } catch (error) {
    console.error("Netzwerkfehler:", error);
    alert("Es gab einen Netzwerkfehler.");
  }
}
