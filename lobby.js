
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
        defenseSize = data.battles.battles[0][2];
        skySize = data.battles.battles[0][3];
        console.log(skySize);
      }
      welcome.innerHTML = `Welcome back <a id="welcome-user" class="navbar-brand" href="#">` + data.user + `</a>`;
      addBattlesToTable(data.battles);
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
  setDefense.setAttribute('hidden', true);
  cockpitCoordinates.value = '';
  cockpitValue.value = '';
  flightDirection.value = 0;
  grabDataAndFeedtoPage;
  unchallengedBattles.removeAttribute('hidden');
})

submitButton.addEventListener('click', async () => {

  if (!cockpitCoordinates.value || !cockpitValue.value || flightDirection.value == 0) {

    error.innerText = "flight direction and cockpit coordinates are required fields!";
    error.style.color = 'red';
    error.style.fontWeight = 'bold';
  } else {
    error.innerText = '';
    const formData = new FormData();
    formData.append("receipt", receipt.files[0])
    formData.append("description", description.value)
    formData.append("amount", amount.value)
    formData.append("type_id", category.value)
    console.log(...formData)
    try {
      let res = await fetch(url, {
        'credentials': 'include',
        'method': 'POST',
        'body': formData
      })
      console.log(res);
      while (tbody.hasChildNodes()) {
        tbody.removeChild(tbody.lastChild);
      }
      receipt.value = '';
      description.value = '';
      amount.value = '';
      category.value = 0;
      data = await res.json();
      addReimbursementsToTable(data);
      newReimb.setAttribute('hidden', true);
      if (res.status == 201) {

        console.log(data);
        success.removeAttribute('hidden');
        if (data.message == 'Request resolve status: True')
          success.innerText = 'The reimbursement request has been added successfully!';
        setTimeout(() => {
          success.setAttribute('hidden', true);
        }, 5000)
      }
    } catch (err) {
      if (err.message == "Failed to fetch") {
        welcome.innerText = "Server unreachable: contact IT Admin";
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
      // 'credentials': 'same-origin',
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

document.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-value')) {
    cockpitCoordinates.value = e.target.innerText;
    cockpitValue.value = e.target.getAttribute('data-value');
  }
})



function addBattlesToTable(data) {
  for (b of data.battles) {
    let row = document.createElement('tr');

    let playerName = document.createElement('td');
    playerName.innerHTML = `<select name="accept-challenge-in-row" class="filter-in-row"> <option class="accepted dropdown-item" value=1` +
      `>` + b[1] + `</option> <option class="accepted dropdown-item" value="` + b[0] + `">Accept Challenge</option>`;    // playerName.innerHTML = b[1];
    let defenseSize = document.createElement('td');
    defenseSize.innerHTML = b[2];
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

testPlane.addEventListener('click', (e) => {
  e.preventDefault();
  let planeLength = 4;
  let cockpit = cockpitValue.value;
  console.log(cockpit);
  console.log("skySize", skySize);
  let direction = flightDirection.value;
  console.log(direction);
  let message = '';
  switch (direction) {
    case '1':
      if (2 < cockpit % skySize && cockpit % skySize < skySize - 2 && cockpit < skySize * (skySize - planeLength - 1) - 1) {
        message += 'Valid in the sky';
      } else {
        message += 'Invalid plane placement in the sky';
      }
      break;
    case '2':
      if (planeLength - 1 < cockpit % skySize < skySize && cockpit < skySize * (skySize - 2)) {
        message += 'Valid in the sky';
        console.log('case 2');
      }
      break;
    case '3':
      if (2 < cockpit % skySize < skySize - 2 && (planeLength - 1) * skySize + 2 <= cockpit < skySize * skySize) {
        message += 'Valid in the sky';
        console.log('case 3');
      }
      break;
    case '4':
      if (planeLength - 1 < cockpit % skySize < skySize && cockpit < skySize * (skySize - 2)) {
        message += 'Valid in the sky';
        console.log('case 4');
      }
      break;
    default:
      message += 'Invalid plane placement in the sky';
      break;
  }
  if (message == 'Valid in the sky') {
    planeMessage.style.color = 'green';
  } else {
    planeMessage.style.color = 'red';
  }
  planeMessage.innerText = message;
})

// flightDirection.addEventListener('change', (e) => {
//   cockpit = cockpitValue.value;
//   direction = flightDirection.value;
//   console.log("cockpit direction", cockpit, direction);
//   if (cockpit && direction != 0) {
//     // document.getElementsByClassName('grid-cell').hasAttribute('data-value').setAttribute('style', 'background-color: red');
//     // let cockpit = document.querySelector('[data-value=cockpitValue]');
//     // cockpit.setAttribute('style', 'background-color: blue');
//     let sky = document.getElementsByClassName('grid-cell');
//     console.log("target", e.target);
//     let currentSelection = [];
//     for (el of sky) {
//       if (flightDirection.value = 1) {
//         if (cockpitValue + skySize - 2 < el.getAttribute('data-value') < cockpitValue + skySize + 2) {
//           el.setAttribute('style', 'background-color: green');
//         } else if (el.getAttribute('data-value') == cockpitValue + 2 * skySize) {
//           el.setAttribute('style', 'background-color: green');
//         }
//         else if (cockpitValue + 3 * skySize - 1 < el.getAttribute('data-value') < cockpitValue + 3 * skySize + 1) {
//           el.setAttribute('style', 'background-color: green');
//         }
//       } else if (flightDirection.value = 2) {
//         if (cockpitValue + skySize - 2 < el.getAttribute('data-value') < cockpitValue + skySize + 2) {
//           el.setAttribute('style', 'background-color: green');
//         } else if (el.getAttribute('data-value') == cockpitValue + 2 * skySize) {
//           el.setAttribute('style', 'background-color: green');
//         }
//         else if (cockpitValue + 3 * skySize - 1 < el.getAttribute('data-value') < cockpitValue + 3 * skySize + 1) {
//           el.setAttribute('style', 'background-color: green');
//         }
//       }
//     }
//   }
// })
