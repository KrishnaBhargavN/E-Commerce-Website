// const { response } = require("express");

let avaialbleRoomsData = [];
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("booking-form");
    const button = document.getElementById("check-availability-btn");

    button.addEventListener("click", function() {
      const formDataObject = {};
      formDataObject["building_name"] = document.querySelector("#booking-form input[placeholder='building_name']").value;
      formDataObject["floor"] = document.querySelector("#booking-form input[placeholder='floor']").value;
      formDataObject["room_number"] = document.querySelector("#booking-form input[placeholder='Room number']").value;
      formDataObject["wing"] = document.querySelector("#booking-form input[placeholder='wing']").value;

      if (Object.values(formDataObject).every(value => value.trim() === "")) {
        alert("Please fill out at least one field");
        return;
      }

      console.log(JSON.stringify(formDataObject))
      // Send data to API
      fetch("http://localhost:3000/routes/fetch/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formDataObject)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        renderStudentCards(data);
      })
      .catch(error => {
        console.error("Error:", error);
      });
    });
});

function createStudentCard(student) {
    var card = document.createElement('div');
    card.classList.add('student-card');
    
    var description = document.createElement('div');
    description.classList.add('student-description');
    
    var name = document.createElement('h2');
    name.id = 'name';
    name.textContent = student.NAME;
    
    var block = document.createElement('h3');
    block.id = 'block';
    block.textContent = 'Student ID: ' + student.STUDENT_ID;
    
    var contact = document.createElement('h3');
    contact.id = 'contact';
    contact.textContent = 'Contact Info: ' + student.CONTACT_NUMBER;
    
    var detailsButton = document.createElement('button');
    detailsButton.classList.add('details');
    detailsButton.textContent = 'View Details';
    
    
    var swapButton = document.createElement('button');
    swapButton.classList.add('swap');
    swapButton.textContent = 'Room Swap';
    
    swapButton.addEventListener('click', function() {
      sendRoomSwapRequest(student);
    });

    detailsButton.addEventListener('click', function() {
        view(student);
    });

    description.appendChild(name);
    description.appendChild(block);
    description.appendChild(contact);
    
    card.appendChild(description);
    card.appendChild(detailsButton);
    card.appendChild(swapButton);
    
    return card;
}

function sendRoomSwapRequest(student) {
  const check = confirm('Are you sure you want to request a room swap?');
  if (check) {
      // Check if swap request already exists
      fetch('http://localhost:3000/routes/swapRequest/checkSwapRequestIsValid', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(student),
      })
      .then(response => response.json())
      .then(data => {
          if (data.exists) {
              alert('A swap request already exists for this student. Cannot send duplicate request.');
          } else {
              // If no existing swap request, proceed to send new request
              fetch('http://localhost:3000/routes/swapRequest/sendRequestToStudent', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(student),
              })
              .then(response => {
                  if (response.ok) {
                      // Show success message
                      alert('Request for room swap has been successfully sent to the student.');
                  } else {
                      // Handle error response
                      alert('Error sending room swap request. Please try again later.');
                  }
              })
              .catch(error => {
                  console.error('Error:', error);
                  alert('Error sending room swap request. Please try again later.');
              });
          }
      })
      .catch(error => {
          console.error('Error checking swap request:', error);
          alert('Error checking swap request. Please try again later.');
      });
  }
}



function renderStudentCards(apiResponse) {
    var container = document.querySelector('.card-container');
    console.log(apiResponse);
    // Clear existing cards
    container.innerHTML = '';
    
    // Create and append cards for each student
    apiResponse.forEach(function(student) {
        var card = createStudentCard(student);
        container.appendChild(card);
    });
}

function fetchData() {
    
    fetch('http://localhost:3000/routes/fetch/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            avaialbleRoomsData = data;
            renderStudentCards(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
    });
}

fetchData();

