const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
let home = document.getElementById("home");
let welcomeUser = document.getElementById("welcome-user");
let loginStatusButton = document.getElementById("login-status");
let spinner = document.getElementById("spinner");
let message = document.getElementById("message");
let defeat = document.getElementById("concede-defeat");
let defenseSky = document.getElementById("battle-defense-sky");
let attackSky = document.getElementById("battle-attack-sky");
let defenseCells = defenseSky.getElementsByClassName("grid-cell");
let attackCells = attackSky.getElementsByClassName("grid-cell");
let attackCoords = document.getElementById("attack-coords");
let defenseMessages = document.getElementById("defense-messages");
let attackMessages = document.getElementById("attack-messages");
let user = null;
let battleData = null;

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
      user = data.user;
      welcomeUser.innerText = data.user;
      if (user) {
        loadBattleData();
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



const loadBattleData = async () => {
  while (defenseSky.hasChildNodes()) {
    defenseSky.removeChild(defenseSky.lastChild);
  }
  while (attackSky.hasChildNodes()) {
    attackSky.removeChild(attackSky.lastChild);
  }
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
        battleData = data;
        message.removeAttribute('hidden');
        battleData.status[2].turn == "This is your turn to attack." ?
          message.setAttribute('style', 'color: green;') :
          message.setAttribute('style', 'color: red;');
        message.innerText = battleData.status[2].turn;
        buildSky(defenseSky);
        buildSky(attackSky);
        displayDefense(battleData.status[1].my_defense, battleData.status[1].opponent_attacks);

        [...attackCells]
          .filter(el => !battleData.status[1].my_attacks.includes(parseInt(el.getAttribute('data-value'))))
          .forEach(element => { element.addEventListener("click", attack); });
        // [...attackCells]
        //   .filter(el => battleData.status[1].my_attacks.includes(parseInt(el.getAttribute('data-value'))))
        //   .forEach(element => {
        //     element.removeEventListener("click", attack);
        //     element.setAttribute('class', 'grid-cell-attacked');
        //   });

        displayAttack(battleData.status[0].attack_messages);
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

const buildSky = (el) => {
  let layoutSize = battleData.status[3].sky + 1
  for (let i = 0; i < layoutSize * layoutSize; i++) {
    if (i == 0) {
      let cell = document.createElement('div');
      cell.appendChild(document.createTextNode('1'));
      cell.classList.add('grid-cell-outer-top');
      cell.innerText = String.fromCharCode(i - 1 + 'A'.charCodeAt(0));
      el.appendChild(cell);
    }
    else if (i < layoutSize && i != 0) {
      let cell = document.createElement('div');
      cell.appendChild(document.createTextNode('2'));
      cell.classList.add('grid-cell-outer-top');
      cell.innerText = String.fromCharCode(i - 1 + 'A'.charCodeAt(0));
      el.appendChild(cell);
    } else if (i % layoutSize == 0 && i != 0) {
      let cell = document.createElement('div');
      cell.appendChild(document.createTextNode('3'));
      cell.classList.add('grid-cell-outer-side');
      cell.innerText = i / layoutSize;
      el.appendChild(cell);
    } else {
      let cell = document.createElement('div');
      cell.appendChild(document.createTextNode(parseInt(i / layoutSize).toString() + ':' + String.fromCharCode(i % layoutSize - 1 + 'A'.charCodeAt(0))));
      cell.classList.add('grid-cell');
      cell.setAttribute('data-value', i - layoutSize - parseInt(i / layoutSize));
      el.appendChild(cell);
    }
  }
  el.setAttribute('style', `grid-template-columns: repeat(` + layoutSize + `, auto);`)
}

const displayDefense = (defenseArray, opponentAttacks) => {
  if (defenseArray.length > 0) {
    for (arr of defenseArray) {
      Array.from(defenseCells)
        .filter(el => arr.includes(parseInt(el.getAttribute('data-value'))))
        .forEach(el => el.setAttribute('style', 'background-color: orange;'));
    }
  }
  if (opponentAttacks.length) {
    let killedPlanes = [];
    let cockpits = [];
    let hitPlaneParts = [];
    let notInDefense = true;
    let missedAttacks = [];

    for (const attack of opponentAttacks) {
      for (const arr of defenseArray) {
        if (arr[0] == attack) {
          killedPlanes.push(arr);
          cockpits.push(attack);
          notInDefense = false;
        }
        else if (arr.includes(attack)) {
          hitPlaneParts.push(attack);
          notInDefense = false;
        }
      }
      if (notInDefense) {
        missedAttacks.push(attack);
      }
      notInDefense = true;
    }
    let nonKilledPlaneParts = hitPlaneParts
      .filter(el => !killedPlanes.flat().includes(el));
    for (const arr of killedPlanes) {
      Array.from(defenseCells)
        .filter(el => arr.includes(parseInt(el.getAttribute('data-value'))))
        .forEach(el => el.setAttribute('style', 'background-color: grey;'));
    }
    for (const c of cockpits) {
      Array.from(defenseCells)
        .filter(el => c == parseInt(el.getAttribute('data-value')))
        .forEach(el => el.setAttribute('style', 'background-color: black;'));
    }
    for (const hit of hitPlaneParts) {
      Array.from(defenseCells)
        .filter(el => hit == parseInt(el.getAttribute('data-value')))
        .forEach(el => el.setAttribute('style', 'background-color: red;'));
    }
    for (const part of nonKilledPlaneParts) {
      Array.from(defenseCells)
        .filter(el => part == parseInt(el.getAttribute('data-value')))
        .forEach(el => el.setAttribute('style', 'background-color: red;'));
    }
    for (const missed of missedAttacks) {
      Array.from(defenseCells)
        .filter(el => missed == parseInt(el.getAttribute('data-value')))
        .forEach(el => el.setAttribute('style', 'background-color: blue;'));
    }
  }
}

const attack = (e) => {
  let attack = e.target.getAttribute('data-value');
  console.log(attack);
  attackCoords.value = e.target.innerText;
  console.log(battleData.status[1].my_attacks.includes(parseInt(attack)));
  if (battleData.status[1].my_attacks.includes(parseInt(attack))) {
    let originalMessage = message.innerText;
    message.innerText = "You have already attacked this position";
    message.setAttribute('style', 'color: red;');
    setTimeout(() => {
      message.innerText = originalMessage;
    }, 2500);
  } else {
    fetchAttack(attack);
  }
}

const fetchAttack = async (attack) => {
  try {
    let res = await fetch(url + `/battles/` + battleData.battleID + `?attack=True`, {
      'credentials': 'include',
      'method': 'PUT',
      'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': 'true'
      },
      'body': JSON.stringify({
        'attack': attack
      }),
    })
    if (res.status == 200) {
      data = await res.json();
      console.log("fetch attack", data);
      refreshData();
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

const refreshData = async () => {
  if (!user) {
    window.location.href = '/index.html';
  } else {
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
        if (data.battles) {
          window.location.href = '/lobby.html';
        } else if (data.status) {
          battleData = data;
          data.status[2].turn == "This is your turn to attack." ?
            message.setAttribute('style', 'color: green;') :
            message.setAttribute('style', 'color: red;');
          message.innerText = battleData.status[2].turn;
          displayDefense(battleData.status[1].my_defense, battleData.status[1].opponent_attacks);
          [...attackCells]
            .filter(el => battleData.status[1].my_attacks.includes(parseInt(el.getAttribute('data-value'))))
            .forEach(element => { element.addEventListener("click", attack); });
          [...attackCells]
            .filter(el => battleData.status[1].my_attacks.includes(parseInt(el.getAttribute('data-value'))))
            .forEach(element => {
              element.removeEventListener("click", attack);
              element.setAttribute('class', 'grid-cell-attacked');
            });
          displayAttack(battleData.status[0].attack_messages);
        }
      }
      else if (res.status == 401) {
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
}

setInterval(refreshData, 3000);
// const loadMessagesToTextArea = (msg, el) => {
//   for (const m of msg) {
//     el.innerText += `Attack @ ` + attackSky.querySelector(`[data-value="${m[0]}"]`) + ` is a ` + m[1] + `!\n`;
//   }
// }

const displayAttack = (messages) => {
  let kills = [];
  let hits = [];
  let misses = [];
  for (const m of messages) {
    switch (m[1]) {
      case "Kill":
        kills.push(m[0]);
        break;
      case "Hit":
        hits.push(m[0]);
        break;
      case "Miss":
        misses.push(m[0]);
        break;
      default:
        break;
    }
  }
  console.log("kills, hits, misses", kills, hits, misses);
  console.log("attackCells", [...attackCells]);
  [...document.querySelectorAll('.grid-cell-attacked')]
    .filter(el => kills.includes(parseInt(el.getAttribute('data-value'))))
    .forEach(el => el.setAttribute('style', 'background-color: black;'));
  [...document.querySelectorAll('.grid-cell-attacked')]
    .filter(el => hits.includes(parseInt(el.getAttribute('data-value'))))
    .forEach(el => el.setAttribute('style', 'background-color: red;'));
  [...document.querySelectorAll('.grid-cell-attacked')]
    .filter(el => misses.includes(parseInt(el.getAttribute('data-value'))))
    .forEach(el => el.setAttribute('style', 'background-color: blue;'));
}
