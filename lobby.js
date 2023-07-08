const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
let welcome = document.getElementById('welcome');
let home = document.getElementById("header1");
let welcomeUser = document.getElementById('welcome-user');
let loginStatusButton = document.getElementById('login-status');
let battleHistoryLink = document.getElementById('battle-history-link');
let battleHistorySection = document.getElementById('battle-history');
let lobbyLink = document.getElementById('lobby-link-container');
let newChallenge = document.getElementById('new-challenge');
let unchallengedBattles = document.getElementById('unchallenged-battles');
let setDefense = document.getElementById('set-defense');
let defenseSky = document.getElementById('defense-sky');
let tbody = document.getElementById('battle-tbl-tbody');
let tHistoryBody = document.getElementById('battle-history-tbl-tbody');
let submitButton = document.getElementById('submit-btn');
let cancelButton = document.getElementById('cancel-btn');
let filter = document.getElementById('filter');
let error = document.getElementById('error-message');
let serverError = document.getElementById('sever-error');
let success = document.getElementById('success-messages');
let remainingPlanes = document.getElementById('remaining-planes');
let flightDirection = document.getElementById('flight-direction');
let cockpitValue = document.getElementById('cockpit-value');
let cockpitCoordinates = document.getElementById('cockpit-coordinates');
let skyCells = document.getElementsByClassName('grid-cell');
let unchallengedList = document.getElementById('unchallenged-list');
let testPlane = document.getElementById('test-plane');
let planeMessage = document.getElementById('plane-message');
let spinner1 = document.getElementById('spinner1');
let spinner2 = document.getElementById('spinner2');
let spinner3 = document.getElementById('spinner3');
let defenseTimer = document.getElementById('defense-setup-timer');
let userMenu = document.getElementById('user-menu');
let changeEmailLink = document.getElementById('change-email-link');
let changeEmailSection = document.getElementById('change-email');
let changeEmailMessages = document.getElementById('change-email-messages');
let currentEmailInput = document.getElementById('current-email');
let newEmailInput = document.getElementById('new-email');
let emailPasswordInput = document.getElementById('email-password');
let changeEmailButton = document.getElementById('change-email-btn');
let cancelEmailButton = document.getElementById('cancel-email-btn');
let changePasswordLink = document.getElementById('change-password-link');
let changePasswordSection = document.getElementById('change-password');
let changePasswordMessages = document.getElementById('change-password-messages');
let currentPasswordInput = document.getElementById('current-password');
let newPasswordInput = document.getElementById('new-password');
let confirmPasswordInput = document.getElementById('confirm-password');
let changePasswordButton = document.getElementById('change-password-btn');
let cancelPasswordButton = document.getElementById('cancel-password-btn');
let url = `http://127.0.0.1:5000`
let user = null;
let data = null;
let nIntervId = null;
let existingDefense = null;
let skySize = null;
let defenseSize = null;

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
      user = data;
      welcomeUser.innerText = user.username;
      if (user) {
        grabDataAndFeedtoPage();
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
};

const grabDataAndFeedtoPage = async () => {

  while (tbody.hasChildNodes()) {
    tbody.removeChild(tbody.lastChild);
  }
  while (tHistoryBody.hasChildNodes()) {
    tHistoryBody.removeChild(tHistoryBody.lastChild);
  }
  while (defenseSky.hasChildNodes()) {
    defenseSky.removeChild(defenseSky.lastChild);
  }
  try {
    spinner1.removeAttribute('hidden');
    let res = await fetch(url + '/battles', {
      'credentials': 'include',
      'method': 'GET',
      'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': 'true'
      }
    })
    if (res.status == 200) {
      data = await res.json();
      spinner1.setAttribute('hidden', true);
      console.log(data);
      if (data.battles.message == 'Finish your current battle engagement, before attempting a new one!') {
        unchallengedBattles.setAttribute('hidden', true);
        setDefense.removeAttribute('hidden');
        newChallenge.innerText = '';
        while (welcome.hasChildNodes()) {
          welcome.removeChild(welcome.lastChild);
        }
        welcome.innerText = `Hi  ` + data.user + `!`;
        const timer = setInterval(() => {
          let now = new Date().getTime();
          let startDate = Date.parse(data.battles.battles[0][4]);
          let distance = startDate - now;
          let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          hours < 10 ? hours = "0" + hours : hours;
          let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          minutes < 10 ? minutes = "0" + minutes : minutes;
          let seconds = Math.floor((distance % (1000 * 60)) / 1000);
          seconds < 10 ? seconds = "0" + seconds : seconds;
          defenseTimer.innerText = hours + ":" + minutes + ":" + seconds;
          if (distance < 0) {
            clearInterval(timer);
            defenseTimer.innerText = "00:00:00";
            flightDirection.value = 1;
            cockpitValue.value = 0
            cockpitCoordinates.value = "1:A";
            submitButton.click();
          }
        }, 1000);
        console.log(data.battles.battles);
        defense(data.battles.battles)
        existingDefense = data.battles.battles[0][1];
        displayDefense(existingDefense);
        console.log("existingDefense", existingDefense);
        defenseSize = data.battles.battles[0][2];
        skySize = data.battles.battles[0][3];
        [...skyCells].forEach(element => { element.addEventListener("click", testPlacement); });
        console.log(skySize);
      } else if (data.battles.message == 'Please resume battle screen') {
        window.location.href = '/battle.html';
      }
      success.innerText = '';
      welcomeUser.innerText = `Hi  ` + data.user + `!`;
      addBattlesToTable(data);
    }
    if (res.status == 401) {
      window.location.href = '/index.html';
    }
  } catch (err) {
    if (err.message == "Failed to fetch") {
      success.removeAttribute('hidden');
      success.innerText = "Server unreachable: contact site admin";
      success.style.color = 'red';
      success.style.fontWeight = 'bold';
    }
    else {
      console.log(err)
    }
  }
};

document.addEventListener("DOMContentLoaded", getUser);
unchallengedList.addEventListener("click", grabDataAndFeedtoPage);

const displayDefense = (defense) => {
  if (defense.length > 0) {
    for (arr of defense) {
      Array.from(skyCells)
        .filter(el => arr.includes(parseInt(el.getAttribute('data-value'))))
        .forEach(el => el.setAttribute('style', 'background-color: grey'));
    }
  }
}

loginStatusButton.addEventListener('click', async () => {

  let res = await fetch(url + '/logout', {
    'credentials': 'include',
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json'
    },
  })
  if (res.status == 200) {
    success.removeAttribute('hidden');
    success.innerText += "Thank you for playing!";
    setTimeout(() => { window.location.href = '/index.html'; }, 2000)
    for (let i = 0; i < 1500; i += 300) {
      setTimeout(() => { success.innerText += "."; }, i)
    }
  }
})

changeEmailLink.addEventListener('click', async () => {
  if (!setDefense.hasAttribute('hidden')) {
    setDefense.setAttribute('hidden', true);
  } else if (!unchallengedBattles.hasAttribute('hidden')) {
    unchallengedBattles.setAttribute('hidden', true);
  } else if (!changePasswordSection.hasAttribute('hidden')) {
    changePasswordSection.setAttribute('hidden', true);
  }
  changeEmailSection.removeAttribute('hidden');
  currentEmailInput.value = user.email;
  changeEmailButton.addEventListener('click', async (e) => {
    // e.preventDefault();
    if (!newEmailInput.value || !emailPasswordInput.value) {

      changeEmailMessages.innerText = "Please fill both fields";
      changeEmailMessages.style.color = 'red';
      changeEmailMessages.style.fontWeight = 'bold';
    } else {
      changeEmailMessages.innerText = "";
      try {
        let res = await fetch(url + `/users`, {
          'credentials': 'include',
          'method': 'PUT',
          'headers': {
            'Content-Type': 'application/json'
          },
          'body': JSON.stringify({
            'email': newEmailInput.value,
            'password': emailPasswordInput.value
          })
        })
        if (res.status == 200) {
          changeEmailMessages.innerText += "Email changed successfully! Re-authenticate to confirm changes.... Click cancel to return to the Lobby";
          changeEmailMessages.style.color = 'green';
          newEmailInput.value = '';
          emailPasswordInput.value = '';
        } else if (res.status == 400 || res.status == 403) {
          data = await res.json();
          changeEmailMessages.innerText = data.message;
          changeEmailMessages.style.color = 'red';
          changeEmailMessages.style.fontWeight = 'bold';
        } else if (res.status == 401) {
          window.location.href = '/index.html';
        }
      } catch (err) {
        if (err.message == "Failed to fetch") {
          changeEmailMessages.removeAttribute('hidden');
          changeEmailMessages.innerText = "Server unreachable: contact site admin";
          changeEmailMessages.style.color = 'red';
          changeEmailMessages.style.fontWeight = 'bold';
        }
        else {
          console.log(err)
        }
      }
    }
  })
  cancelEmailButton.addEventListener('click', () => {
    changeEmailSection.setAttribute('hidden', true);
    unchallengedBattles.removeAttribute('hidden');
    getUser();
  })
})

newEmailInput.addEventListener('change', (e) => {
  changeEmailMessages.innerText = "";
  let email = newEmailInput.value;
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    changeEmailMessages.innerText = "Invalid email format";
    changeEmailMessages.style.color = 'red';
    changeEmailMessages.style.fontWeight = 'bold';
  }
});

changePasswordLink.addEventListener('click', async () => {
  if (!setDefense.hasAttribute('hidden')) {
    setDefense.setAttribute('hidden', true);
  } else if (!unchallengedBattles.hasAttribute('hidden')) {
    unchallengedBattles.setAttribute('hidden', true);
  } else if (!changeEmailSection.hasAttribute('hidden')) {
    changeEmailSection.setAttribute('hidden', true);
  }
  changePasswordSection.removeAttribute('hidden');
  changePasswordButton.addEventListener('click', async (e) => {
    // e.preventDefault();
    if (!newPasswordInput.value || !confirmPasswordInput.value || !currentPasswordInput.value) {

      changePasswordMessages.innerText = "Please fill all fields without errors";
      changePasswordMessages.style.color = 'red';
      changePasswordMessages.style.fontWeight = 'bold';
    } else {
      changePasswordMessages.innerText = "";
      try {
        let res = await fetch(url + `/users`, {
          'credentials': 'include',
          'method': 'PUT',
          'headers': {
            'Content-Type': 'application/json'
          },
          'body': JSON.stringify({
            'current-password': currentPasswordInput.value,
            'new-password': newPasswordInput.value
          })
        })
        if (res.status == 200) {
          changePasswordMessages.innerText += "Email changed successfully! We will log you out to confirm changes....";
          changePasswordMessages.style.color = 'green';
          currentPasswordInput.value = '';
          newPasswordInput.value = '';
          confirmPasswordInput.value = '';
          setTimeout(() => { loginStatusButton.click(); }, 2000)
        } else if (res.status == 400 || res.status == 403) {
          data = await res.json();
          changePasswordMessages.innerText = data.message;
          changePasswordMessages.style.color = 'red';
          changePasswordMessages.style.fontWeight = 'bold';
        } else if (res.status == 401) {
          window.location.href = '/index.html';
        }
      } catch (err) {
        if (err.message == "Failed to fetch") {
          changePasswordMessages.removeAttribute('hidden');
          changePasswordMessages.innerText = "Server unreachable: contact site admin";
          changePasswordMessages.style.color = 'red';
          changePasswordMessages.style.fontWeight = 'bold';
        }
        else {
          console.log(err)
        }
      }
    }
  })
  cancelPasswordButton.addEventListener('click', () => {
    changePasswordSection.setAttribute('hidden', true);
    unchallengedBattles.removeAttribute('hidden');
    getUser();
  })
})

newPasswordInput.addEventListener('change', (e) => {
  changePasswordMessages.innerText = "";
  let password = newPasswordInput.value;
  let confirmPassword = confirmPasswordInput.value;
  if (!password.match(/[a-z]/g)) {
    changePasswordMessages.innerText = "Password must contain at least one lowercase letter";
    changePasswordMessages.classList.add('b-error');
  }
  else if (!password.match(/[A-Z]/g)) {
    changePasswordMessages.innerText = "Password must contain at least one uppercase letter";
    changePasswordMessages.classList.add('b-error');
  }
  else if (!password.match(/[0-9]/g)) {
    changePasswordMessages.innerText = "Password must contain at least one number";
    changePasswordMessages.classList.add('b-error');
  }
  else if (!password.match(/[!@#$%^&*.]/g)) {
    changePasswordMessages.innerText = "Password must contain at least one special character";
    changePasswordMessages.classList.add('b-error');
  }

  else if (password.length < 8 || password.length > 20) {
    changePasswordMessages.innerText = "Password length must be between 8 and 20 characters";
    changePasswordMessages.classList.add('b-error');
  } else {
    changePasswordMessages.innerText = "";
    changePasswordMessages.classList.remove('b-error');
  }
});

confirmPasswordInput.addEventListener('change', (e) => {
  changePasswordMessages.innerText = "";
  let password = newPasswordInput.value;
  let confirmPassword = confirmPasswordInput.value;
  if (password != confirmPassword) {
    changePasswordMessages.innerText = "Passwords do not match";
    changePasswordMessages.classList.add('b-error');
  } else {
    changePasswordMessages.innerText = "";
    changePasswordMessages.classList.remove('b-error');
  }
});

lobbyLink.addEventListener('click', () => {
  if (!battleHistorySection.hasAttribute('hidden')) {
    battleHistorySection.setAttribute('hidden', true);
  } else if (!setDefense.hasAttribute('hidden')) {
    setDefense.setAttribute('hidden', true);
  } else if (!changePasswordSection.hasAttribute('hidden')) {
    changePasswordSection.setAttribute('hidden', true);
  } else if (!changeEmailSection.hasAttribute('hidden')) {
    changeEmailSection.setAttribute('hidden', true);
  }
  unchallengedBattles.removeAttribute('hidden');
  unchallengedList.click();
  lobbyLink.setAttribute('hidden', true);
  battleHistoryLink.removeAttribute('hidden');
});


battleHistoryLink.addEventListener('click', async () => {
  if (!setDefense.hasAttribute('hidden')) {
    setDefense.setAttribute('hidden', true);
  } else if (!unchallengedBattles.hasAttribute('hidden')) {
    unchallengedBattles.setAttribute('hidden', true);
  } else if (!changePasswordSection.hasAttribute('hidden')) {
    changePasswordSection.setAttribute('hidden', true);
  } else if (!changeEmailSection.hasAttribute('hidden')) {
    changeEmailSection.setAttribute('hidden', true);
  }
  battleHistorySection.removeAttribute('hidden');
  battleHistoryLink.setAttribute('hidden', true);
  lobbyLink.removeAttribute('hidden');
  try {
    spinner3.removeAttribute('hidden');
    let res = await fetch(url + '/battles?history=True', {
      'credentials': 'include',
      'method': 'GET',
      'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': 'true'
      }
    })
    if (res.status == 200) {
      data = await res.json();
      spinner3.setAttribute('hidden', true);
      console.log(data);
      success.innerText = '';
      addBattleResultsToTable(data.history);
    }
    if (res.status == 401) {
      window.location.href = '/index.html';
    }
  } catch (err) {
    if (err.message == "Failed to fetch") {
      success.removeAttribute('hidden');
      success.innerText = "Server unreachable: contact site admin";
      success.style.color = 'red';
      success.style.fontWeight = 'bold';
    }
    else {
      console.log(err)
    }
  }
})

cancelButton.addEventListener('click', () => {
  cockpitCoordinates.value = '';
  cockpitValue.value = '';
  // flightDirection.value = 0;
  grabDataAndFeedtoPage();
  // planeMessage.innerText = "Finish setting up your defense within the timeframe!";
  // planeMessage.style.color = 'red';
  spinner2.setAttribute('hidden', true);
})

submitButton.addEventListener('click', async () => {
  console.log("coockpitCoords cockpitVal Direction", cockpitCoordinates.value, cockpitValue.value, flightDirection.value);
  if (!cockpitCoordinates.value || !cockpitValue.value || flightDirection.value == 0) {

    planeMessage.innerText = "flight direction and cockpit coordinates are required fields!";
    planeMessage.style.color = 'red';
  } else {
    while (defenseSky.hasChildNodes()) {
      defenseSky.removeChild(defenseSky.lastChild);
    }
    try {

      spinner2.removeAttribute('hidden');
      let res = await fetch(url + `/battles/` + data.battles.battles[0][0] + `?defense=True`, {
        'credentials': 'include',
        'method': 'PUT',
        'headers': {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Credentials': 'true'
        },
        'body': JSON.stringify({
          "cockpit": cockpitValue.value,
          "direction": flightDirection.value,
          "sky": data.battles.battles[0][3]
        })
      })
      if (res.status == 200) {
        let data = await res.json();
        spinner2.setAttribute('hidden', true);
        if (data.message != "Defense setup complete!") {
          // success.removeAttribute('hidden');
          // success.innerText = data.message;
          setTimeout(() => {
            cancelButton.click();
            // success.setAttribute('hidden', true);
          }, 500)
        } else {
          window.location.href = '/battle.html';
        }

      } else if (res.status == 400 || res.status == 403) {
        let data = await res.json();
        spinner2.setAttribute('hidden', true);
        if (data.message == "Time frame to add planes for defense setup elapsed.") {
          planeMessage.innerText = data.message;
          planeMessage.style.color = 'red';
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
        planeMessage.innerText = data.message;
        planeMessage.style.color = 'red';
        setTimeout(() => {
          cancelButton.click();
        }, 500);

      } if (res.status == 401) {
        spinner2.setAttribute('hidden', true);
        window.location.href = '/index.html';
      }
    } catch (err) {
      if (err.message == "Failed to fetch") {
        success.innerHTML = "Server unreachable: contact IT Admin";
        success.style.color = 'red';
        success.style.fontWeight = 'bold';
      }
    }
  }
})

filter.addEventListener('change', async (e) => {

  while (tbody.hasChildNodes()) {
    tbody.removeChild(tbody.lastChild);
  }
  try {
    let res = await fetch(url + "reimbursements?status=" + filter.value, {
      'credentials': 'include',
      'method': 'GET',
      'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': 'true'
      }
    })

    data = await res.json();
    addReimbursementsToTable(data);
  } catch (err) {
    if (err.message == "Failed to fetch") {
      success.innerHTML = "Server unreachable: contact IT Admin";
      success.style.color = 'red';
      success.style.fontWeight = 'bold';
    }
  }
});

document.addEventListener('click', (e) => {
  e.stopPropagation();
  e.target.addEventListener('change', async (e) => {
    if (String(e.target.innerHTML).includes('class="accepted dropdown-item"')) {
      console.log(e.target.value)
      while (tbody.hasChildNodes()) {
        tbody.removeChild(tbody.lastChild);
      }
      try {
        spinner1.removeAttribute('hidden');
        let res = await fetch(url + `/battles/` + e.target.value + `?accepted=True`, {
          'credentials': 'include',
          'method': 'PUT',
          'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': 'true'
          }
        })
        if (res.status == 200) {
          let data = await res.json();
          spinner1.setAttribute('hidden', true);
          success.removeAttribute('hidden');
          success.innerText = data.message;
          setTimeout(() => { window.location.reload(); }, 1000)
        }
      } catch (err) {
        if (err.message == "Failed to fetch") {
          success.removeAttribute('hidden');
          success.innerText = "Server unreachable: contact IT Admin";
          success.style.color = 'red';
          success.style.fontWeight = 'bold';
        }
        else {
          console.log(err)
        }
      }
    }
  })
})

function addBattlesToTable(data) {
  for (b of data.battles.battles) {
    let row = document.createElement('tr');

    let playerName = document.createElement('td');
    playerName.innerHTML = `<select name="accept-challenge-in-row" class="filter-in-row" style="background: gainsboro;"> <option class="accepted dropdown-item" value=1` +
      `>` + b[2] + `</option> <option class="accepted dropdown-item" value="` + b[0] + `">Accept Challenge</option>`;    // playerName.innerHTML = b[1];
    let defenseSize = document.createElement('td');
    defenseSize.innerHTML = b[1];
    let skySize = document.createElement('td');
    skySize.innerHTML = b[3];
    let time = document.createElement('td');
    const timer = setInterval(() => {
      let now = new Date().getTime();
      let startDate = Date.parse(b[4]);
      let distance = startDate - now;
      let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      hours < 10 ? hours = "0" + hours : hours;
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      minutes < 10 ? minutes = "0" + minutes : minutes;
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);
      seconds < 10 ? seconds = "0" + seconds : seconds;
      time.innerText = hours + ":" + minutes + ":" + seconds;
      if (distance < 0) {
        clearInterval(timer);
        time.innerText = "EXPIRED";
      }
    }, 1000);

    row.appendChild(playerName);
    row.appendChild(defenseSize);
    row.appendChild(skySize);
    row.appendChild(time);
    if (b[2] != data.user)
      tbody.appendChild(row);
  }
}

function addBattleResultsToTable(data) {
  for (b of data) {
    let row = document.createElement('tr');

    let details = document.createElement('td');
    details.innerHTML = `<a name="view-battle" href="/battle.html" class="cursor-pointer view-battle text-nowrap" data-value-battleID="` + b.id + `" data-value-sky="` + b.skySize + `" data-value-defense="` + b.defenseSize + `"> View Details</a>`;
    let opponent = document.createElement('td');
    opponent.innerText = b.opponent;
    let outcome = document.createElement('td');
    if (b.winner != "Unavailable") {
      if (b.winner != b.opponent) {
        outcome.innerText = "Victory";
        outcome.style.color = "green";
      }
      else {
        outcome.innerText = "Defeat";
        outcome.style.color = "red";
      }
    } else {
      outcome.innerText = "Inconclusive";
    }
    let defenseSize = document.createElement('td');
    defenseSize.innerText = b.defenseSize;
    let skySize = document.createElement('td');
    skySize.innerText = b.skySize;
    let concludedAt = document.createElement('td');

    concludedAt.innerText = (new Date(b.concludedAt)).toLocaleString();
    concludedAt.classList.add('text-nowrap');
    let disconnected = document.createElement('td');
    disconnected.innerText = b.disconnected;

    row.appendChild(details);
    row.appendChild(opponent);
    row.appendChild(outcome);
    row.appendChild(defenseSize);
    row.appendChild(skySize);
    row.appendChild(concludedAt);
    row.appendChild(disconnected);
    tHistoryBody.appendChild(row);
  }
  document.querySelectorAll('a[name="view-battle"]').forEach((e) => {
    e.addEventListener('click', async (e) => {

      console.log(e.target.getAttribute('data-value'));
      localStorage.setItem('battleID', e.target.getAttribute('data-value-battleID'));
      localStorage.setItem('skySize', e.target.getAttribute('data-value-sky'));
      localStorage.setItem('defenseSize', e.target.getAttribute('data-value-defense'));
      // while (tHistoryBody.hasChildNodes()) {
      //   tHistoryBody.removeChild(tHistoryBody.lastChild);
      // }
      // battleHistorySection.setAttribute('hidden', true);
      // battleDetailsSection.removeAttribute('hidden');
      // try {
      //   spinner4.removeAttribute('hidden');
      //   let res = await fetch(url + `/battles?battleID=` + e.target.getAttribute('data-value'), {
      //     'credentials': 'include',
      //     'method': 'GET',
      //     'headers': {
      //       'Content-Type': 'application/json',
      //       'Access-Control-Allow-Credentials': 'true'
      //     }
      //   })
      //   if (res.status == 200) {
      //     let data = await res.json();
      //     spinner4.setAttribute('hidden', true);
      //     success.removeAttribute('hidden');
      //     success.innerText = data.message;
      //     setTimeout(() => { window.location; }, 1000)
      //   }
      // } catch (err) {
      //   if (err.message == "Failed to fetch") {
      //     success.removeAttribute('hidden');
      //     success.innerText = "Server unreachable: contact IT Admin";
      //     success.style.color = 'red';
      //     success.style.fontWeight = 'bold';
      //   }
      //   else {
      //     console.log(err)
      //   }
      // }

    })
  })
}

function defense(b) {
  let layoutSize = b[0][3] + 1
  for (let i = 0; i < layoutSize * layoutSize; i++) {
    if (i == 0) {
      let cell = document.createElement('div');
      cell.appendChild(document.createTextNode('1'));
      cell.classList.add('grid-cell-outer-top');
      cell.innerText = String.fromCharCode(i - 1 + 'A'.charCodeAt(0));
      defenseSky.appendChild(cell);
    }
    else if (i < layoutSize && i != 0) {
      let cell = document.createElement('div');
      cell.appendChild(document.createTextNode('2'));
      cell.classList.add('grid-cell-outer-top');
      cell.innerText = String.fromCharCode(i - 1 + 'A'.charCodeAt(0));
      defenseSky.appendChild(cell);
    } else if (i % layoutSize == 0 && i != 0) {
      let cell = document.createElement('div');
      cell.appendChild(document.createTextNode('3'));
      cell.classList.add('grid-cell-outer-side');
      cell.innerText = i / layoutSize;
      defenseSky.appendChild(cell);
    } else {
      let cell = document.createElement('div');
      cell.appendChild(document.createTextNode(parseInt(i / layoutSize).toString() + ':' + String.fromCharCode(i % layoutSize - 1 + 'A'.charCodeAt(0))));
      cell.classList.add('grid-cell');
      cell.setAttribute('data-value', i - layoutSize - parseInt(i / layoutSize));
      defenseSky.appendChild(cell);
    }
  }
  defenseSky.setAttribute('style', `width: ` + layoutSize * 50 + `px; height: ` + layoutSize * 50 + `px;`);

  // defenseSky.setAttribute('style', `grid-template-columns: repeat(` + layoutSize + `, auto);`)
  //set remaining planes
  if (b[0][1]) {
    let currentDefenseSize = b[0][1].length;
    remainingPlanes.innerText = b[0][2] - currentDefenseSize;
  } else {
    remainingPlanes.innerText = b[0][2];
  }


}

const testPlacement = (e) => {
  e.preventDefault();
  let planeLength = 4;
  let wingSpan = 2;
  let cockpit = e.target.getAttribute('data-value');
  cockpitValue.value = cockpit;
  cockpitCoordinates.value = e.target.innerText;
  let direction = flightDirection.value;
  currentDefense = existingDefense;
  displayDefense(currentDefense);
  let message = '';
  let plane = [];
  let nextPlanePart = null;
  let overlap = false;
  let overlapingDivs = [];
  planeMessage.style.color = 'red';

  if (direction == '0') {
    message += 'Please select a flight direction first';
  } else if (!cockpit) {
    message += 'Please click to select cockpit placement';
  } else {
    plane.push(document.querySelector(`[data-value="` + cockpit + `"]`));
    let sky = document.querySelectorAll('.grid-cell');
    for (s of sky) {
      s.setAttribute('style', 'background-color: none;');
    }

    switch (direction) {
      case '1':
        if (wingSpan <= cockpit % skySize && cockpit % skySize < skySize - wingSpan && cockpit < skySize * (skySize - (planeLength - 1))) {
          message += 'Valid in the sky';
          nextPlanePart = parseInt(cockpit) + parseInt(skySize) - wingSpan;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) + parseInt(skySize) * 2;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) + parseInt(skySize) * 3 - 1;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
        } else {
          message += 'Invalid plane placement in the sky';
        }
        break;
      case '2':
        if (planeLength - 1 <= cockpit % skySize && cockpit % skySize < skySize && cockpit > skySize * wingSpan && cockpit < skySize * (skySize - wingSpan)) {
          message += 'Valid in the sky';
          nextPlanePart = parseInt(cockpit) - parseInt(skySize) * 2 - 1;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySize);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySize);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySize);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySize);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) - 2;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) - parseInt(skySize) - 3;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySize);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySize);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
        } else {
          message += 'Invalid plane placement in the sky';
        }
        break;
      case '3':
        if (wingSpan <= cockpit % skySize && cockpit % skySize < skySize - wingSpan && (planeLength - 1) * skySize + wingSpan <= cockpit && cockpit < skySize * skySize) {
          message += 'Valid in the sky';
          nextPlanePart = parseInt(cockpit) - parseInt(skySize) - wingSpan;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) - parseInt(skySize) * 2;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) - parseInt(skySize) * 3 - 1;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
        } else {
          message += 'Invalid plane placement in the sky';
        }
        break;
      case '4':
        if (cockpit % skySize < skySize - (planeLength - 1) && cockpit > skySize * wingSpan - 1 && cockpit < skySize * (skySize - wingSpan)) {
          message += 'Valid in the sky';
          nextPlanePart = parseInt(cockpit) - parseInt(skySize) * 2 + 1;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySize);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySize);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySize);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySize);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) + 2;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) - parseInt(skySize) + 3;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySize);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySize);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
        } else {
          message += 'Invalid plane placement in the sky';
        }
        break;
      case '0':
        message += 'Select a flight direction first';
        break;
      default:
        message += 'Invalid plane placement in the sky';
        break;
    }
    for (p of currentDefense) {
      console.log(p);
      for (div of plane) {
        if (p.includes(parseInt(div.getAttribute('data-value')))) {
          overlapingDivs.push(div);
          overlap = true;
        }
      }
    }
    overlap ? message += ', but overlaps other plane(s)!' : message += ' and current defense!';

    if (message == 'Valid in the sky and current defense!') {
      displayDefense(existingDefense);
      plane[0].setAttribute('style', 'background-color: red');
      planeMessage.style.color = 'green';
      if (plane.length > 1) {
        for (p in plane) {
          if (p != 0) {
            plane[p].setAttribute('style', 'background-color: green');
          }
        }
      }
    } else {
      displayDefense(existingDefense);
      plane[0].setAttribute('style', 'background-color: red');
      for (p in plane) {
        if (p != 0) {
          plane[p].setAttribute('style', 'background-color: green');
        }
      }
      for (div of overlapingDivs) {
        div.setAttribute('style', 'background-color: purple');
      }
    }
    planeMessage.innerText = message;
  }
};
