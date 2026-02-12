let users = [
  {
    name: "max",
    email: "max12@test.de",
    password: "test123",
  },
];

function addUser() {
  let name = document.getElementById("username");
  let email = document.getElementById("email");
  let password = document.getElementById("password");

  users.push({
    name: name.value,
    email: email.value,
    password: password.value,
  });

  window.location.href = "login.html?msg=Deine Registrierung war erfolgreich";
}
