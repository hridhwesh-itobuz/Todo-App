console.log(window.location);

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginSubmit = document.getElementById("loginSubmit");

loginSubmit.addEventListener("click", async (e) => {
  e.preventDefault();

  const user = {
    email: email.value,
    password: password.value,
  };

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      console.log(data.access_token, "\n", data.refresh_token);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      window.location.href = "../../index.html";
    } else {
      const errorData = await response.json();
      alert(`Login failed: ${errorData.message}`);
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("An error occurred. Please try again later.");
  }
});
