
let welcome = document.getElementById('welcome');
let welcomeUser = document.getElementById('welcome-user');
let loginStatusButton = document.getElementById('login-status');
let header3 = document.getElementById('header3');
let header2 = document.getElementById('header2');
let unchallengedBattles = document.getElementById('unchallenged-battles');
let setDefense = document.getElementById('set-defense');
let defenseSky = document.getElementById('defense-sky');
let tbody = document.getElementById('battle-tbl-tbody');
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
let url = `http://127.0.0.1:5000`
let data = null;
let nIntervId = null;
let existingDefense = null;
let skySize = null;
let defenseSize = null;



const grabDataAndFeedtoPage = async () => {
  while (tbody.hasChildNodes()) {
    tbody.removeChild(tbody.lastChild);
  }
  while (defenseSky.hasChildNodes()) {
    defenseSky.removeChild(defenseSky.lastChild);
  }
  try {
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
      console.log(data);
      if (data.battles.message == 'Finish your current battle engagement, before attempting a new one!') {
        unchallengedBattles.setAttribute('hidden', true);
        setDefense.removeAttribute('hidden');
        console.log(data.battles.battles);
        defense(data.battles.battles)
        existingDefense = data.battles.battles[0][1];
        displayDefense(existingDefense);
        console.log("existingDefense", existingDefense);
        defenseSize = data.battles.battles[0][2];
        skySize = data.battles.battles[0][3];
        [...skyCells].forEach(element => { element.addEventListener("click", testPlacement); });
        console.log(skySize);
      }
      welcome.innerHTML = `Welcome back <a id="welcome-user" class="navbar-brand" href="#">` + data.user + `</a>`;
      addBattlesToTable(data);
    }
    if (res.status == 401) {
      window.location.href = '/index.html';
    }
  } catch (err) {
    if (err.message == "Failed to fetch") {
      serverError.innerText = "Server unreachable: contact IT Admin";
      serverError.style.color = 'red';
      serverError.style.fontWeight = 'bold';
    }
    else {
      console.log(err)
    }
  }
};


// window.addEventListener('popstate', grabDataAndFeedtoPage);
document.addEventListener("DOMContentLoaded", grabDataAndFeedtoPage);
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
    success.innerHTML += '<br><br>'
    success.innerText += "Logging you out ";
    success.innerHTML += '<br><br>'
    for (let i = 0; i < 1500; i += 200) {
      setTimeout(() => { success.innerText += "."; }, i)
    }

    setTimeout(() => { window.location.href = '/index.html'; }, 2000)


  }
})


cancelButton.addEventListener('click', () => {
  cockpitCoordinates.value = '';
  cockpitValue.value = '';
  flightDirection.value = 0;
  window.location.reload();
  planeMessage.innerText = "Finish setting up your defense within the timeframe!";
  planeMessage.style.color = 'red';
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
        if (data.message != "Defense setup complete!") {
          success.removeAttribute('hidden');
          success.innerText = data.message;
          setTimeout(() => {
            window.location.reload();
            if (!data.message == "done") {

            }
          }, 3000)
        } else {
          window.location.href = '/game.html';
        }
      } else if (res.status < 500) {
        let data = await res.json();
        planeMessage.innerText = data.message;
        planeMessage.style.color = 'red';
        setTimeout(() => {
          window.location.reload();
        }, 3000)

      }
    } catch (err) {
      if (err.message == "Failed to fetch") {
        welcome.innerHTML = "Server unreachable: contact IT Admin";
        welcome.style.color = 'red';
        welcome.style.fontWeight = 'bold';
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
      welcome.innerHTML = "Server unreachable: contact IT Admin";
      welcome.style.color = 'red';
      welcome.style.fontWeight = 'bold';
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
          success.removeAttribute('hidden');
          success.innerText = data.message;
          setTimeout(() => { window.location.reload(); }, 3000)
        }
      } catch (err) {
        if (err.message == "Failed to fetch") {
          welcome.innerHTML = "Server unreachable: contact IT Admin";
          welcome.style.color = 'red';
          welcome.style.fontWeight = 'bold';
        }
      }
    }
  })
})

function addBattlesToTable(data) {
  for (b of data.battles.battles) {
    let row = document.createElement('tr');

    let playerName = document.createElement('td');
    playerName.innerHTML = `<select name="accept-challenge-in-row" class="filter-in-row"> <option class="accepted dropdown-item" value=1` +
      `>` + b[2] + `</option> <option class="accepted dropdown-item" value="` + b[0] + `">Accept Challenge</option>`;    // playerName.innerHTML = b[1];
    let defenseSize = document.createElement('td');
    defenseSize.innerHTML = b[1];
    let skySize = document.createElement('td');
    skySize.innerHTML = b[3];

    row.appendChild(playerName);
    row.appendChild(defenseSize);
    row.appendChild(skySize);

    tbody.appendChild(row);
  }
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
  defenseSky.setAttribute('style', `grid-template-columns: repeat(` + layoutSize + `, auto);`)
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
    overlap ? message += ', but overlaps other plane' : message += ' and current defense';

    if (message == 'Valid in the sky and current defense') {
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
