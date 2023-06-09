const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
let welcome = document.getElementById('welcome');
let home = document.getElementById('header1');
let welcomeUser = document.getElementById('welcome-user');
let logoutButton = document.getElementById('logout-btn');
let setDefense = document.getElementById('set-defense');
let defenseSky = document.getElementById('defense-sky');
let setParams = document.getElementById('set-params-btn');
let resetParams = document.getElementById('reset-params-btn');
let evaluatePlane = document.getElementById('evaluate-btn');
let openChallenge = document.getElementById('open-btn');
let error = document.getElementById('error-message');
let serverError = document.getElementById('sever-error');
let successMessage = document.getElementById('success-messages');
let paramMessage = document.getElementById('params-message');
let remainingPlanes = document.getElementById('remaining-planes');
let flightDirection = document.getElementById('flight-direction');
let cockpitValue = document.getElementById('cockpit-value');
let cockpitCoordinates = document.getElementById('cockpit-coordinates');
let skyCells = null;
let planeMessage = document.getElementById('plane-message');
let spinner2 = document.getElementById('spinner2');
let defenseTimer = document.getElementById('defense-setup-timer');
let defenseTimer1 = document.getElementById('defense-setup-timer1');
let skySize = document.getElementById('sky-size');
let defenseSize = document.getElementById('defense-size');
let maxTime = document.getElementById('max-time');
let url = `http://127.0.0.1:5000`
// let data = null;
// let nIntervId = null;
let existingDefense = [];
let defenseIDs = [];
let skySZ = null;
let defenseSz = null;
let expirationTime = null;
let challenger = false;
let battle = false;
let battleID = null;


home.addEventListener("click", function() {
  window.location.href = "index.html";
});

setParams.addEventListener('click', () => {
  if (skySize.value != 0 && defenseSize.value != 0 && maxTime.value > 0) {
    paramMessage.innerText = '';
    skySZ = parseInt(skySize.value);
    defenseSz = parseInt(defenseSize.value);
    expirationTime = parseInt(maxTime.value);
    defense();
    skyCells = document.getElementsByClassName('grid-cell');
    [...skyCells].forEach(element => { element.addEventListener("click", testPlacement); });
    skySize.setAttribute('disabled', true);
    defenseSize.setAttribute('disabled', true);
    setParams.style.visibility = 'hidden';
  } else {
    paramMessage.innerText = 'Please set all parameters!';
    paramMessage.removeAttribute('hidden');
    paramMessage.style.color = 'red';
  }
});

resetParams.addEventListener('click', () => {
  skySize.value = 0;
  defenseSize.value = 0;
  maxTime.value = '';
  skySZ = null;
  defenseSz = null;
  expirationTime = null;
  while (defenseSky.hasChildNodes()) {
    defenseSky.removeChild(defenseSky.lastChild);
  }
  skySize.removeAttribute('disabled');
  defenseSize.removeAttribute('disabled');
  setParams.style.visibility = 'visible';
  existingDefense = [];
  defenseIDs = [];
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
      successMessage.removeAttribute('hidden');
      successMessage.innerText = "Server unreachable: contact site admin";
      successMessage.style.color = 'red';
      successM.style.fontWeight = 'bold';
    }
    else {
      console.log(err)
    }
  }
};

document.addEventListener("DOMContentLoaded", getUser);

const displayDefense = (existingDefense) => {
  if (existingDefense.length > 0) {
    for (arr of existingDefense) {
      Array.from(skyCells)
        .filter(el => arr.includes(parseInt(el.getAttribute('data-value'))))
        .forEach(el => el.setAttribute('style', 'background-color: grey'));
    }
  }
}

logoutButton.addEventListener('click', async () => {
  let res = await fetch(url + '/logout', {
    'credentials': 'include',
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json'
    },
  })
  if (res.status == 200) {
    successMessage.removeAttribute('hidden');
    successMessage.innerText += "Thank you for playing!";
    successMessage.innerHTML += "<br><br>"
    successMessage.innerText += "Logging you out ";
    successMessage.innerHTML += "<br><br>"
    setTimeout(() => { window.location.href = '/index.html'; }, 2000)
    for (let i = 0; i < 1500; i += 300) {
      setTimeout(() => { successMessage.innerText += "."; }, i)
    }

  }
})

evaluatePlane.addEventListener('click', async () => {
  console.log("remainingPlanes.value", remainingPlanes.innerText);
  console.log("coockpitCoords cockpitVal Direction", cockpitCoordinates.value, cockpitValue.value, flightDirection.value);
  if (!skySZ || !defenseSz || !expirationTime) {
    console.log("Set challenge params first!", skySZ, defenseSz, expirationTime);
    planeMessage.innerText = "Set challenge params first!";
    planeMessage.style.color = 'red';
  }
  else if (!cockpitCoordinates.value && !cockpitValue.value && flightDirection.value === "0") {
    planeMessage.innerText = "flight direction and cockpit coordinates are required fields!";
    planeMessage.style.color = 'red';
  } else if (parseInt(remainingPlanes.innerText) < 1) {
    planeMessage.innerText = "Reset challenge params to add more planes";
    planeMessage.style.color = 'red';
  } else if (planeMessage.innerText != "Valid in the sky and current defense!") {
    planeMessage.innerHTML = planeMessage.innerText + `<br>` + `Invalid plane placement!`;
    planeMessage.style.color = 'red';
  }
  else {
    while (defenseSky.hasChildNodes()) {
      defenseSky.removeChild(defenseSky.lastChild);
    }
    planeMessage.innerText = "";
    try {
      spinner2.removeAttribute('hidden');
      let res = await fetch(url + `/planes?` + `cockpit=` + parseInt(cockpitValue.value) + `&&direction=` + flightDirection.value + `&&sky=` + skySZ, {
        'credentials': 'include',
        'method': 'GET',
        'headers': {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Credentials': 'true'
        }
      })
      if (res.status == 200) {
        let data = await res.json();
        spinner2.setAttribute('hidden', true);
        console.log(existingDefense);
        console.log(defenseIDs);
        if (data.message == "No Match") {
          planeMessage.innerText = "Failed to identify plane";
          planeMessage.style.color = 'red';
        } else {
          defenseIDs.push(parseInt(data.message.id));
          existingDefense.push(data.message.plane);
          defense();
          displayDefense(existingDefense);
          skyCells = document.getElementsByClassName('grid-cell');
          [...skyCells].forEach(element => { element.addEventListener("click", testPlacement); });
        }

      } else if (res.status == 400) {
        let data = await res.json();
        spinner2.setAttribute('hidden', true);
        planeMessage.innerText = data.message;
        planeMessage.style.color = 'red';

      } else if (res.status == 401) {
        spinner2.setAttribute('hidden', true);
        window.location.href = '/index.html';
      }
    } catch (err) {
      if (err.message == "Failed to fetch") {
        successMessage.innerHTML = "Server unreachable: contact site admin";
        successMessage.style.color = 'red';
        successMessage.style.fontWeight = 'bold';
      }
    }
  }
})

openChallenge.addEventListener('click', async () => {
  if (parseInt(remainingPlanes.innerText)) {
    planeMessage.innerText = "Match the number of added planes of the challenge params";
    planeMessage.style.color = 'red';
  } else if (!maxTime.value || parseInt(maxTime.value) < 1 || !defenseSz || !skySZ) {
    paramMessage.innerText = "Challenge expiration time is a required field!";
  } else {
    try {
      spinner2.removeAttribute('hidden');
      let res = await fetch(url + `/battles`, {
        'credentials': 'include',
        'method': 'POST',
        'headers': {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Credentials': 'true'
        },
        body: JSON.stringify({
          "max-time": parseInt(maxTime.value),
          "defense": defenseIDs,
          "defense-size": defenseSz,
          "sky-size": skySZ
        })
      })
      if (res.status == 201) {
        spinner2.setAttribute('hidden', true);
        let data = await res.json();
        console.log(data);
        battleID = data.battleId;
        defenseTimer.removeAttribute('hidden');
        let beginChallenger = 0
        const timer = setInterval(() => {
          beginChallenger += 1000;
          let now = new Date().getTime();
          let startDate = Date.parse(data.timeStamp);
          let distance = startDate - now + defenseSz * 60000;
          let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          hours < 10 ? hours = "0" + hours : hours;
          let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          minutes < 10 ? minutes = "0" + minutes : minutes;
          let seconds = Math.floor((distance % (1000 * 60)) / 1000);
          seconds < 10 ? seconds = "0" + seconds : seconds;
          defenseTimer.innerText = hours + ":" + minutes + ":" + seconds;
          if (beginChallenger % 3000 == 0 && !challenger) {
            checkForChallenger();
          }
          else if (distance < defenseSz * 60000 && !challenger) {
            clearInterval(timer);
            defenseTimer.innerText = "00:00:00";
            planeMessage.innerText = "No challenger found!";
            planeMessage.style.color = 'red';
            setTimeout(() => {
              window.location.href = '/lobby.html';
            }, 5000);
          } else if (challenger && distance > 0) {

            checkForBattle();
          } else if (distance < 0) {
            clearInterval(timer);
            defenseTimer.innerText = "00:00:00";
            planeMessage.innerText = "Challenger failed to setup their defense in time!";
            planeMessage.style.color = 'red';
            setTimeout(() => {
              window.location.href = '/lobby.html';
            }, 5000);
          }

        }, 1000);

        openChallenge.setAttribute('hidden', true);
      } else if (res.status == 400 || res.status == 403) {
        spinner2.setAttribute('hidden', true);
        let data = await res.json();
        planeMessage.innerText = data.message;
        planeMessage.style.color = 'red';
      } else if (res.status == 401) {
        window.location.href = '/index.html';
      }
    } catch (err) {
      if (err.message == "Failed to fetch") {
        successMessage.innerHTML = "Server unreachable: contact site admin";
        successMessage.style.color = 'red';
        successMessage.style.fontWeight = 'bold';
      }
    }
  }
});

const checkForChallenger = async () => {
  try {
    let res = await fetch(url + `/battles`, {
      'credentials': 'include',
      'method': 'GET',
      'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': 'true'
      }
    })
    if (res.status == 200) {
      let data = await res.json();
      console.log(data.battles.message);
      if (data.battles.message == "Please resume battle screen") {
        challenger = true;
        planeMessage.innerText = "Challenger found!";
        planeMessage.style.color = 'green';
        checkForBattle();
      }

    } else if (res.status == 400 || res.status == 403) {
      let data = await res.json();
      planeMessage.innerText = data.message;
      planeMessage.style.color = 'red';
    } else if (res.status == 401) {
      window.location.href = '/index.html';
    }
  } catch (err) {
    if (err.message == "Failed to fetch") {
      successMessage.innerHTML = "Server unreachable: contact site admin";
      successMessage.style.color = 'red';
      successMessage.style.fontWeight = 'bold';
    }
  }
}

const checkForBattle = async () => {
  console.log("checking for battle", battleID);
  try {
    let res = await fetch(url + `/battles?defeat=False`, {
      'credentials': 'include',
      'method': 'GET',
      'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': 'true'
      }
    })
    if (res.status == 200) {
      let data = await res.json();
      console.log(data);
      if (data.status[0] == "Wait for your opponent's attack.") {
        setTimeout(() => {
          window.location.href = '/battle.html';
        }, 5000);

      }
    } else if (res.status == 400 || res.status == 403) {
      let data = await res.json();
      if (data.message == "Use battle history") {
        setTimeout(() => {
          window.location.href = '/lobby.html';
        }, 5000);
      }
      planeMessage.innerText = "Challenger is setting up their defense!";
      planeMessage.style.color = 'gray';
    } else if (res.status == 401) {
      window.location.href = '/index.html';

    }
  } catch (err) {
    if (err.message == "Failed to fetch") {
      successMessage.innerHTML = "Server unreachable: contact site admin";
      successMessage.style.color = 'red';
      successMessage.style.fontWeight = 'bold';
    }
  }
};

const defense = () => {
  let layoutSize = skySZ + 1
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
  defenseSky.setAttribute('style', `grid-template-columns: repeat(` + layoutSize + `, auto);`)
  // set remaining planes
  if (defenseSz) {
    let currentDefenseSize = existingDefense.length;
    remainingPlanes.innerText = defenseSz - currentDefenseSize;
  }
}

const testPlacement = (e) => {
  // e.preventDefault();
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
    let skyC = document.querySelectorAll('.grid-cell');
    for (s of skyC) {
      s.setAttribute('style', 'background-color: none;');
    }
    switch (direction) {
      case '1':
        if (wingSpan <= cockpit % skySZ && cockpit % skySZ < skySZ - wingSpan && cockpit < skySZ * (skySZ - (planeLength - 1))) {
          message += 'Valid in the sky';
          nextPlanePart = parseInt(cockpit) + parseInt(skySZ) - wingSpan;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) + parseInt(skySZ) * 2;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) + parseInt(skySZ) * 3 - 1;
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
        if (planeLength - 1 <= cockpit % skySZ && cockpit % skySZ < skySZ && cockpit > skySZ * wingSpan && cockpit < skySZ * (skySZ - wingSpan)) {
          message += 'Valid in the sky';
          nextPlanePart = parseInt(cockpit) - parseInt(skySZ) * 2 - 1;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySZ);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySZ);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySZ);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySZ);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) - 2;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) - parseInt(skySZ) - 3;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySZ);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySZ);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
        } else {
          message += 'Invalid plane placement in the sky';
        }
        break;
      case '3':
        if (wingSpan <= cockpit % skySZ && cockpit % skySZ < skySZ - wingSpan && (planeLength - 1) * skySZ + wingSpan <= cockpit && cockpit < skySZ * skySZ) {
          message += 'Valid in the sky';
          nextPlanePart = parseInt(cockpit) - parseInt(skySZ) - wingSpan;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart++;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) - parseInt(skySZ) * 2;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) - parseInt(skySZ) * 3 - 1;
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
        if (cockpit % skySZ < skySZ - (planeLength - 1) && cockpit > skySZ * wingSpan - 1 && cockpit < skySZ * (skySZ - wingSpan)) {
          message += 'Valid in the sky';
          nextPlanePart = parseInt(cockpit) - parseInt(skySZ) * 2 + 1;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySZ);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySZ);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySZ);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySZ);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) + 2;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart = parseInt(cockpit) - parseInt(skySZ) + 3;
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySZ);
          plane.push(document.querySelector(`[data-value="` + nextPlanePart + `"]`));
          nextPlanePart += parseInt(skySZ);
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
