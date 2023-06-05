
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
let navbarSupportedContent = document.getElementById("navbarSupportedContent");
let welcomeUser = document.getElementById("welcome-user");
let loginLink = document.getElementById("login-link");
let loginStatusButton = document.getElementById("login-status");
let url = `http://127.0.0.1:5000`
let successMessageDiv = document.getElementById("success-messages");
let spinner = document.getElementById("spinner");

const getUser = async () => {
  try {
    let res = await fetch(url + '/users', {
      'credentials': 'include',
      'method': 'GET',
      'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': 'true'
      }
    })
    if (res.status == 200) {
      navbarSupportedContent.removeAttribute('hidden');
      loginLink.style.visibility = 'hidden';
      data = await res.json();
      welcomeUser.innerText = data.user;
      console.log(data.user);
    }
    if (res.status == 401) {
      navbarSupportedContent.style.visibility = 'hidden';
      loginLink.style.visibility = 'visible';
    }
  } catch (err) {
    if (err.message == "Failed to fetch") {
      successMessageDiv.removeAttribute('hidden');
      successMessageDiv.innerText = "Server unreachable: contact site admin";
      successMessageDiv.style.color = 'red';
      successMessageDiv.style.fontWeight = 'bold';
    }
    else {
      console.log(err)
    }
  }
};

document.addEventListener("DOMContentLoaded", getUser);

loginStatusButton.addEventListener('click', async () => {
  spinner.removeAttribute('hidden');
  let res = await fetch(url + '/logout', {
    'credentials': 'include',
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json'
    },
  })
  if (res.status == 200) {
    spinner.setAttribute('hidden', true);
    window.location.href = '/index.html';
  }
})
