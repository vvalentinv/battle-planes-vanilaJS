const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
let home = document.getElementById("header1");
let welcomeUser = document.getElementById("welcome-user");
let loginStatusButton = document.getElementById("login-status");
let spinner = document.getElementById("spinner");
let message = document.getElementById("message");
let defeat = document.getElementById("concede-defeat");
let url = `http://127.0.0.1:5000`;

home.addEventListener("click", function() {
  window.location.href = "index.html";
});

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
      data = await res.json();
      welcomeUser.innerText = data.user;
    }
    if (res.status == 401) {
      window.location.href = '/index.html';
    }
  } catch (err) {
    if (err.message == "Failed to fetch") {
      message.removeAttribute('hidden');
      message.innerText = "Server unreachable: contact site admin";
      message.setAttribute('class', 'error-message');
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

setInterval(getStatus, 3000);

async function getStatus() {
  try {
    let res = await fetch(url + '/battles?defeat=False', {
      'credentials': 'include',
      'method': 'GET',
      'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': 'true'
      }
    })
    if (res.status == 200) {
      data = await res.json();
      console.log(data);
      welcomeUser.innerText = data.user;
      if (data.battles) {
        window.location.href = '/lobby.html';
      } else {
        message.removeAttribute('hidden');
        message.innerText = data.status[2].turn;
        //paint defense
        //paint attack
        //set click event on attack collection if turn is true
        //load defense messages
        //modify defense screen always
        //load attack messages
        // enable hover on attack collection 
      }

    }
    if (res.status == 401) {
      window.location.href = '/index.html';
    }
  } catch (err) {
    if (err.message == "Failed to fetch") {
      message.removeAttribute('hidden');
      message.innerText = "Server unreachable: contact site admin";
      message.setAttribute('class', 'error-message');
    }
    else {
      console.log(err)
    }
  }
}

defeat.addEventListener('click', concedeDefeat);
async function concedeDefeat() {
  try {
    let res = await fetch(url + '/battles?defeat=True', {
      'credentials': 'include',
      'method': 'GET',
      'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': 'true'
      }
    })
    if (res.status == 200) {
      data = await res.json();
      console.log(data);
      welcomeUser.innerText = data.user;
      message.removeAttribute('hidden');
      message.innerText = "You have conceded defeat, your opponent wins!";
      message.setAttribute('class', 'error-message');
    }
    if (res.status == 401) {
      window.location.href = '/index.html';
    }
  } catch (err) {
    if (err.message == "Failed to fetch") {
      message.removeAttribute('hidden');
      message.innerText = "Server unreachable: contact site admin";
      message.setAttribute('class', 'error-message');
    }
    else {
      console.log(err)
    }
  }
}
