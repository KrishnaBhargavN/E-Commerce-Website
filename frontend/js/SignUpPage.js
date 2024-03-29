document
  .querySelector(".login form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from being submitted in the traditional way
    checkPassword2();
  });
document
  .querySelector(".signup form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from being submitted in the traditional way
    checkPassword();
  });

function checkPassword() {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("cnfrm-password").value;
  const message = document.getElementById("message");

  if (password.length === 0) {
    alert("Password cannot be empty!");
    message.textContent = "";
    return;
  }

  if (password === confirmPassword) {
    // Gather form data
    const fname = document.querySelector(
      "input[name='txt'][placeholder='First name']"
    ).value;
    const lname = document.querySelector(
      "input[name='txt'][placeholder='Last name']"
    ).value;
    const email = document.querySelector("input[name='email']").value;
    const contactNumber = document.querySelector(
      "input[name='txt'][placeholder='Contact number']"
    ).value;
    const address1 = document.querySelector(
      "input[name='txt'][placeholder='Address']"
    ).value;
    const city = document.querySelector(
      "input[name='txt'][placeholder='City']"
    ).value;
    const province = document.querySelector(
      "input[name='txt'][placeholder='Province']"
    ).value;
    const postal_code = document.querySelector(
      "input[name='txt'][placeholder='Postal Code']"
    ).value;

    // Create a JSON object with form data
    const formData = {
      fname: fname,
      lname: lname,
      email: email,
      contactNumber: contactNumber,
      address1: address1,
      city: city,
      province: province,
      postal_code: postal_code,
    };

    // Encode the JSON object as a URL parameter
    const queryParams = new URLSearchParams(formData).toString();
    fetch("http://localhost:3000/routes/authorization/signUp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fname: fname,
        lname: lname,
        email: email,
        contactNumber: contactNumber,
        address1: address1,
        city: city,
        province: province,
        postal_code: postal_code,
        password: password,
      }),
    })
      .then((response) => {
        if (response.ok) {
          // If API call is successful, redirect to another page
          window.location.href = "../screens/MainPage.html";
        } else {
          // If API call fails, parse the JSON response and display error message
          response.json().then((data) => {
            document.getElementById("message2").style.backgroundColor = "red";
            document.getElementById("message2").innerText =
              "Error: " + data.statusMessage;
          });
        }
      })
      .catch((error) => {
        // Catch any network errors
        console.error("Error:", error);
        document.getElementById("message2").innerText =
          "Network Error. Please try again.";
      });
    // Redirect to the next HTML file with URL parameters
    res.cookie("email", email, { maxAge: 3600000, httpOnly: true });
    window.location.href = "./MainPage.html";
  } else {
    message.textContent = "Passwords do not match";
  }
}

function saveToLocalStorage() {
  const email = document.getElementById("savedEmail").value;
  const password = document.getElementById("password").value;

  localStorage.setItem("savedEmail", email);
  localStorage.setItem("savedPassword", password);
}

function checkPassword2() {
  var email = document.getElementById("email-id").value;
  var password = document.getElementById("password1").value;

  // Make API call
  fetch("http://localhost:3000/routes/authorization/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      passcode: password,
    }),
  })
    .then((response) => {
      if (response.ok) {
        // If API call is successful, redirect to another page
        window.location.href = "../screens/MainPage.html";
      } else {
        // If API call fails, parse the JSON response and display error message
        response.json().then((data) => {
          document.getElementById("message2").style.backgroundColor = "red";
          document.getElementById("message2").innerText =
            "Error: " + data.statusMessage;
        });
      }
    })
    .catch((error) => {
      // Catch any network errors
      console.error("Error:", error);
      document.getElementById("message2").innerText =
        "Network Error. Please try again.";
    });
}
