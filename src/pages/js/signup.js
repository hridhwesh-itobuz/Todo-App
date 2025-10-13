const email = document.getElementById("email");
const password = document.getElementById("password");
const otp = document.getElementById("otp");
const sendOtpButton = document.getElementById("sendOtpButton");
const signupSubmit = document.getElementById("signupSubmit");

let otpSent = false;

sendOtpButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const emailValue = email.value;
  const passwordValue = password.value;

  if (!emailValue || !passwordValue) {
    alert("Please enter your email and password first.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/otp/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: emailValue }),
    });

    if (response.ok) {
      alert("OTP sent to your email.");
      otpSent = true;
    } else {
      const errorData = await response.json();
      alert(`Failed to send OTP: ${errorData.message}`);
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    alert("An error occurred. Please try again later.");
  }
});

signupSubmit.addEventListener("click", async (e) => {
  e.preventDefault();

  if (!otpSent) {
    alert("Please send OTP to your email first.");
    return;
  }

  const user = {
    email: email.value,
    password: password.value,
    otp: otp.value,
  };

  try {
    const response = await fetch("http://localhost:3000/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (response.ok) {
      alert("Signup successful! Please log in.");
      window.location.href = "./login.html";
    } else {
      const errorData = await response.json();
      alert(`Signup failed: ${errorData.message}`);
    }
  } catch (error) {
    console.error("Error during signup:", error);
    alert("An error occurred. Please try again later.");
  }
});
