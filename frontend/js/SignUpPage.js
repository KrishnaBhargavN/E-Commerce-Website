document.querySelector('.login form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from being submitted in the traditional way
    checkPassword2();
  });
  document.querySelector('.signup form').addEventListener('submit', function(event) {
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
        const studentName = document.querySelector("input[name='txt'][placeholder='Student name']").value;
        const studentId = document.querySelector("input[name='txt'][placeholder='Student ID']").value;
        const email = document.querySelector("input[name='email']").value;
        const contactNumber = document.querySelector("input[name='txt'][placeholder='Contact number']").value;
        const genderSelect = document.getElementById("gender");
        const gender = genderSelect.value;


        // Create a JSON object with form data
        const formData = {
            studentName: studentName,
            studentId: studentId,
            email: email,
            contactNumber: contactNumber,
            gender: gender,
            password: password
        };

        // Encode the JSON object as a URL parameter
        const queryParams = new URLSearchParams(formData).toString();

        // Redirect to the next HTML file with URL parameters
        window.location.href = "./screens/RoomDetails.html?" + queryParams;
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
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            passcode: password
        })
    })
    .then(response => {
        if (response.ok) {
            // If API call is successful, redirect to another page
            window.location.href = "../screens/MainPage.html";
        } else {
            // If API call fails, parse the JSON response and display error message
            response.json().then(data => {
              document.getElementById("message2").style.backgroundColor = "red"; 
                document.getElementById("message2").innerText = "Error: " + data.statusMessage;
                
            });
        }
    })
    .catch(error => {
        // Catch any network errors
        console.error('Error:', error);
        document.getElementById("message2").innerText = "Network Error. Please try again.";
    });

  }