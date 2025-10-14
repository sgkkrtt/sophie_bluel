const API_BASE_URL = "http://localhost:5678/api/users/login";

const form = document.querySelector("#login-form");
const errorMsg = document.querySelector(".login-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token); // on stocke le token
      window.location.href = "index.html"; // redirection
    } else if (response.status === 401) {
      errorMsg.textContent = "Erreur : identifiant ou mot de passe incorrect.";
    } else {
      errorMsg.textContent = "Erreur serveur, réessayez plus tard.";
    }
  } catch (error) {
    console.error(error);
    errorMsg.textContent = "Impossible de se connecter au serveur.";
  }
});
