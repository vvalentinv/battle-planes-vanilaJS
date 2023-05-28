let usernameInput = document.getElementById('username');
let emailInput = document.getElementById('email');
let passwordInput = document.getElementById('password');
let confirmPasswordInput = document.getElementById('confirm-password');
let registerSubmitButton = document.getElementById('register-submit-btn');
let registerErrorMessageDiv = document.getElementById('register-error-message');
let validUsernameEmail = document.getElementById('register-username-email');
let valid = false;
let url = 'http://127.0.0.1:5000/users';

registerSubmitButton.addEventListener('click', async (e) => {
  e.preventDefault();
  if (usernameInput.value && emailInput.value && passwordInput.value && passwordInput.value != "@mYPassword123!" && confirmPasswordInput.value && valid) {
    try {
      let res = await fetch(url, {
        'credentials': 'include',
        'method': 'POST',
        'headers': {
          'Content-Type': 'application/json'
        },
        'body': JSON.stringify({
          "username": usernameInput.value,
          "email": emailInput.value,
          "password": passwordInput.value
        })
      })
      if (res.status == 201) {
        window.location.href = '/login.html';
      } else if (res.status == 401) {
        let data = await res.json();
        let errorElement = document.createElement('p');
        errorElement.innerHTML = data.message;
        errorElement.style.color = 'red';
        errorElement.style.fontWeight = 'bold';
        loginErrorMessageDiv.appendChild(errorElement);
      }
    } catch (err) {
      if (err.message == "Failed to fetch") {
        let errorElement = document.createElement('p');
        errorElement.innerHTML = "Server issue: contact site admin";
        errorElement.style.color = 'red';
        errorElement.style.fontWeight = 'bold';
        loginErrorMessageDiv.appendChild(errorElement);
      }
    }
  }
});



const validateIdentifiers = async () => {
  validUsernameEmail.innerText = "";
  if (usernameInput.value && emailInput.value && !valid) {
    try {
      let res = await fetch(url, {
        'credentials': 'include',
        'method': 'POST',
        'headers': {
          'Content-Type': 'application/json'
        },
        'body': JSON.stringify({
          "email": emailInput.value,
          "username": usernameInput.value,
          "password": "@mYPassword123!"
        })
      })
      if (res.status != 201) {
        let data = await res.json();
        let errorElement = document.createElement('p');
        errorElement.innerText = data.message;
        errorElement.style.color = 'red';
        errorElement.style.fontWeight = 'bold';
        validUsernameEmail.appendChild(errorElement);
      } else {
        let data = await res.json();
        let validMessage = document.createElement('p');
        if (data.message == "valid") {
          valid = true;
          validMessage.innerText = "Valid username and email for registration";
          validMessage.style.color = 'green';
          validMessage.style.fontWeight = 'bold';
          validUsernameEmail.appendChild(validMessage);
        }

      }
    } catch (err) {
      if (err.message == "Failed to fetch") {
        let errorElement = document.createElement('p');
        errorElement.innerText = "Server issue: contact site admin";
        errorElement.style.color = 'red';
        errorElement.style.fontWeight = 'bold';
        loginErrorMessageDiv.appendChild(errorElement);
      }
    }
  } else if (valid) {
    let validMessage = document.createElement('p');
    validMessage.innerText = "Valid username and email for registration";
    validMessage.style.color = 'green';
    validMessage.style.fontWeight = 'bold';
    validUsernameEmail.appendChild(validMessage);
  }
};

passwordInput.addEventListener('change', validateIdentifiers);
confirmPasswordInput.addEventListener('change', validateIdentifiers);

emailInput.addEventListener('change', (e) => {
  registerErrorMessageDiv.innerText = "";
  validUsernameEmail.innerText = "";
  let email = emailInput.value;
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    let errorElement = document.createElement('p');
    errorElement.innerText = "Invalid email format";
    errorElement.style.color = 'red';
    errorElement.style.fontWeight = 'bold';
    registerErrorMessageDiv.appendChild(errorElement);
  }
});

usernameInput.addEventListener('change', (e) => {
  registerErrorMessageDiv.innerText = "";
  validUsernameEmail.innerText = "";
  let username = usernameInput.value;
  let userRegex = /^[a-zA-Z0-9]+$/;
  if (!userRegex.test(username)) {
    let errorElement = document.createElement('p');
    errorElement.innerText = "Invalid username format";
    errorElement.style.color = 'red';
    errorElement.style.fontWeight = 'bold';
    registerErrorMessageDiv.appendChild(errorElement);
  }
});

passwordInput.addEventListener('change', validatePassword);

confirmPasswordInput.addEventListener('change', (e) => {
  registerErrorMessageDiv.innerText = "";
  let password = passwordInput.value;
  let confirmPassword = confirmPasswordInput.value;
  if (password != confirmPassword) {

    let errorElement = document.createElement('p');
    errorElement.innerText = "Both password fields must match";
    errorElement.style.color = 'red';
    errorElement.style.fontWeight = 'bold';
    registerErrorMessageDiv.appendChild(errorElement);
  }
});


function validatePassword() {
  registerErrorMessageDiv.innerHTML = "";
  let p = passwordInput.value
  // let errors = []

  if (7 > p.length && p.length > 21) {
    let errorElement = document.createElement('p');
    errorElement.innerText = "Your password must be at least 8 characters long and less than 21.";
    errorElement.style.color = 'red';
    errorElement.style.fontWeight = 'bold';
    registerErrorMessageDiv.appendChild(errorElement);
  }
  if (p.search(/[a-z]/) < 0) {
    let errorElement = document.createElement('p');
    errorElement.innerText = "Your password must contain at least one lowercase letter.";
    errorElement.style.color = 'red';
    errorElement.style.fontWeight = 'bold';
    registerErrorMessageDiv.appendChild(errorElement);
  }
  if (p.search(/[A-Z]/) < 0) {
    let errorElement = document.createElement('p');
    errorElement.innerText = "Your password must contain at least one uppercase letter.";
    errorElement.style.color = 'red';
    errorElement.style.fontWeight = 'bold';
    registerErrorMessageDiv.appendChild(errorElement);
  }
  if (p.search(/[0-9]/) < 0) {
    let errorElement = document.createElement('p');
    errorElement.innerText = "Your password must contain at least one digit.";
    errorElement.style.color = 'red';
    errorElement.style.fontWeight = 'bold';
    registerErrorMessageDiv.appendChild(errorElement);
  }
  if (p.search(/[\!\@\#\$\%\^\&\*\.]/) < 0) {
    let errorElement = document.createElement('p');
    errorElement.innerText = "Your password must contain at least one of !@#$%^&*.";
    errorElement.style.color = 'red';
    errorElement.style.fontWeight = 'bold';
    registerErrorMessageDiv.appendChild(errorElement);
  }
}
