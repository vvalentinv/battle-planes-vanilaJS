const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
let home = document.getElementById("home");
let welcomeUser = document.getElementById("welcome-user");
let loginStatusButton = document.getElementById("login-status");
let spinner = document.getElementById("spinner");
let message = document.getElementById("message");
let userTurn = document.getElementById("user-turn-message");
let opponentTurn = document.getElementById("opponent-turn-message");
let backToHistory = document.getElementById("back-to-history");
let defeat = document.getElementById("concede-defeat");
let defenseSky = document.getElementById("battle-defense-sky");
let attackSky = document.getElementById("battle-attack-sky");
let defenseCells = defenseSky.getElementsByClassName("grid-cell");
let attackCells = attackSky.getElementsByClassName("grid-cell");
let attackCoords = document.getElementById("attack-coords");
let defenseMessages = document.getElementById("defense-messages");
let attackMessages = document.getElementById("attack-messages");
let opponentName = document.getElementById("opponent-name");
let opponentTimer = document.getElementById("opponent-timer");
let userTimer = document.getElementById("user-timer");
let battleID = localStorage.getItem('battleID') || "True";
let skySize = localStorage.getItem('skySize') || null;
let defenseSize = localStorage.getItem('defenseSize') || null;
let user = null;
let battleData = null;
let concluded = false;

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
      user = data.username;
      welcomeUser.innerText = data.username;
      if (user && battleID == "True") {
        loadBattleData();
      } else if (user && battleID != "True") {
        buildSky(defenseSky);
        buildSky(attackSky);
        refreshData();
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

    let res = await fetch(url + `/battles?defeat=False&battleID=` + battleID, {
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
        skySize = battleData.status[3].sky
        battleID = data.battleID;
        opponentName.innerText = battleData.opponent + ' attack list';
        setTurnMessage();
        buildSky(defenseSky);
        buildSky(attackSky);
        displayDefense(battleData.status[1].my_defense, battleData.status[1].opponent_attacks);
        [...attackCells]
          .filter(el => !battleData.status[1].my_attacks.includes(parseInt(el.getAttribute('data-value'))))
          .forEach(element => {
            element.addEventListener("click", attack);
            element.addEventListener("mouseover", (e) => {
              attackCoords.value = e.target.innerText;
            });
          });
        [...attackCells]
          .filter(el => battleData.status[1].my_attacks.includes(parseInt(el.getAttribute('data-value'))))
          .forEach(element => {
            element.removeEventListener("click", attack);
            element.setAttribute('class', 'grid-cell-attacked');
          });
        displayAttack(battleData.status[0].attack_messages);

        loadMessagesToTextArea(battleData.status[0].attack_messages, attackMessages);
        loadMessagesToTextArea(battleData.status[0].defense_messages, defenseMessages);

      }

    } if (res.status == 400) {
      window.location.href = '/lobby.html';
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

backToHistory.addEventListener('click', () => {
  backToHistory.setAttribute('hidden', true);
  window.location.href = '/lobby.html';
});


const buildSky = (el) => {
  let layoutSize = parseInt(skySize) + 1;
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
  el.setAttribute('style', `width: ` + layoutSize * 50 + `px; height: ` + layoutSize * 50 + `px;`);
}

const displayDefense = (defenseArray, opponentAttacks) => {
  if (defenseArray.length > 0) {
    for (arr of defenseArray) {
      [...defenseCells]
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
    for (const plane of defenseArray) {
      let planeParts = plane.slice(1);
      let partCount = 0;
      for (const p of planeParts) {
        if (opponentAttacks.includes(p)) {
          partCount++;
          if (partCount == 9) {
            cockpits.push(p);
          }
        }
      }
      if (partCount == 9) {
        killedPlanes.push(plane);
      }
    }
    let nonKilledPlaneParts = hitPlaneParts
      .filter(el => !killedPlanes.flat().includes(el));
    for (const arr of killedPlanes) {
      [...defenseCells]
        .filter(el => arr.includes(parseInt(el.getAttribute('data-value'))))
        .forEach(el => el.setAttribute('style', 'background-color: grey;'));
    }
    for (const c of cockpits) {
      [...defenseCells]
        .filter(el => c == parseInt(el.getAttribute('data-value')))
        .forEach(el => el.setAttribute('style', 'background-color: black; color: white;'));
    }
    for (const hit of hitPlaneParts) {
      [...defenseCells]
        .filter(el => hit == parseInt(el.getAttribute('data-value')))
        .forEach(el => el.setAttribute('style', 'background-color: red;'));
    }
    for (const part of nonKilledPlaneParts) {
      [...defenseCells]
        .filter(el => part == parseInt(el.getAttribute('data-value')))
        .forEach(el => el.setAttribute('style', 'background-color: red;'));
    }
    for (const missed of missedAttacks) {
      [...defenseCells]
        .filter(el => missed == parseInt(el.getAttribute('data-value')))
        .forEach(el => el.setAttribute('style', 'background-color: blue;'));
    }
  }
}

const attack = (e) => {
  let attack = e.target.getAttribute('data-value');
  console.log(attack);
  // attackCoords.value = e.target.innerText;
  console.log(battleData.status[1].my_attacks.includes(parseInt(attack)));
  if (battleData.status[1].my_attacks.includes(parseInt(attack))) {
    let originalMessage = userTurn.innerText;
    userTurn.innerText = `You have already attacked ` + e.target.innerText + ` !`;
    userTurn.setAttribute('style', 'color: red;');
    setTimeout(() => {
      userTurn.innerText = originalMessage;
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
      })
    })
    if (res.status == 200) {
      data = await res.json();
      console.log("fetch attack", data);
      // window.location.reload();
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
      let res = await fetch(url + `/battles?defeat=False&battleID=` + battleID, {
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
        if (data.battles && !battleID) {
          window.location.href = '/lobby.html';
        } else if (data.outcome) {
          backToHistory.removeAttribute('hidden');
          defeat.setAttribute('hidden', 'true');
          opponentName.innerText = data.outcome.opponent + " Attacks:";
          displayDefense(data.outcome.data.my_defense, data.outcome.data.opponent_attacks);

          [...attackCells]
            .forEach(element => {
              element.removeEventListener("click", attack);
              element.setAttribute('class', 'grid-cell-attacked');
            });
          displayAttack(data.outcome.messages.attack_messages);
          if (data.outcome.messages.attack_messages.length >
            data.outcome.messages.defense_messages.length) {
            opponentTurn.innerText = "Win!";
            userTurn.innerText = "Win!";
            opponentTurn.classList.add('b-success');
            userTurn.classList.add('b-success');
          } else {
            opponentTurn.removeAttribute('hidden');
            opponentTurn.innerText = "Defeat!";
            userTurn.innerText = "Defeat!";
            opponentTurn.classList.add('b-error');
            userTurn.classList.add('b-error');
          }
          loadMessagesToTextArea(data.outcome.messages.attack_messages, attackMessages);
          loadMessagesToTextArea(data.outcome.messages.defense_messages, defenseMessages);
          concluded = true;
          localStorage.removeItem('battleID');
          localStorage.removeItem('skySize');
          localStorage.removeItem('defenseSize');
        } else if (data.status) {
          battleData = data;
          battleID = data.battleID;
          opponentName.innerText = data.opponent + " Attack List:";
          setTurnMessage();
          displayDefense(battleData.status[1].my_defense, battleData.status[1].opponent_attacks);
          [...attackCells]
            .filter(el => !battleData.status[1].my_attacks.includes(parseInt(el.getAttribute('data-value'))))
            .forEach(element => {
              element.addEventListener("click", attack);
              element.addEventListener("mouseover", (e) => {
                attackCoords.value = e.target.innerText;
              });
            });
          [...attackCells]
            .filter(el => battleData.status[1].my_attacks.includes(parseInt(el.getAttribute('data-value'))))
            .forEach(element => {
              element.removeEventListener("click", attack);
              element.setAttribute('class', 'grid-cell-attacked');
            });
          displayAttack(battleData.status[0].attack_messages);
          loadMessagesToTextArea(battleData.status[0].attack_messages, attackMessages);
          loadMessagesToTextArea(battleData.status[0].defense_messages, defenseMessages);
        }
      }
      else if (res.status == 401) {
        window.location.href = '/index.html';
      }
      message.innerText = "";
      message.setAttribute('hidden', 'true');
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

setInterval(() => {
  if (!concluded) {
    refreshData();
  }
}, 3000);



// setInterval(refreshData, 3000, concluded);

const loadMessagesToTextArea = (msg, el) => {
  el.value = "";
  for (const m of msg) {
    if (m.length == 2) {
      el.value += `Attack @ ` + attackSky.querySelector(`[data-value="${m[0]}"]`).innerText + ` is a ` + m[1] + ` `;
    } else {
      el.value += m;
    }
  }
  el.scrollTop = el.scrollHeight;
}

const displayAttack = (messages) => {
  let kills = [];
  let hits = [];
  let misses = [];
  for (const m of messages) {
    if (m.length == 2) {
      if (m[1] == "Kill") {
        kills.push(m[0]);
      } else if (m[1] == "Hit") {
        hits.push(m[0]);
      } else if (m[1] == "Miss") {
        misses.push(m[0]);
      }
    }
  }
  console.log("kills, hits, misses", kills, hits, misses);
  [...attackSky.querySelectorAll('.grid-cell-attacked')]
    .filter(el => kills.includes(parseInt(el.getAttribute('data-value'))))
    .forEach(el => el.setAttribute('style', 'background-color: black; color: white;'));
  [...attackSky.querySelectorAll('.grid-cell-attacked')]
    .filter(el => hits.includes(parseInt(el.getAttribute('data-value'))))
    .forEach(el => el.setAttribute('style', 'background-color: red;'));
  [...attackSky.querySelectorAll('.grid-cell-attacked')]
    .filter(el => misses.includes(parseInt(el.getAttribute('data-value'))))
    .forEach(el => el.setAttribute('style', 'background-color: blue;'));
}

const setTurnMessage = () => {
  if (battleData.status[2].turn == "This is your turn to attack.") {
    userTimer.removeAttribute('hidden');
    opponentTimer.setAttribute('hidden', true);
    // userTurn.removeAttribute('hidden');
    userTurn.innerText = "It's your turn to attack!";
    userTurn.setAttribute('style', 'color: green;');
    // opponentTurn.removeAttribute('hidden');
    opponentTurn.innerText = "It's your turn to attack!";
    opponentTurn.setAttribute('style', 'color: green;');
    displayTimer(userTimer, battleData.status[3].time);

  } else {
    userTimer.setAttribute('hidden', true);
    opponentTimer.removeAttribute('hidden');
    // opponentTurn.removeAttribute('hidden');
    opponentTurn.innerText = battleData.opponent + " is attacking ...";
    opponentTurn.setAttribute('style', 'color: red;');
    userTurn.innerText = battleData.opponent + " is attacking ...";
    userTurn.setAttribute('style', 'color: red;');
    displayTimer(opponentTimer, battleData.status[3].time);
  }
}

const displayTimer = (el, time) => {
  el.removeAttribute('hidden');
  const timer = setInterval(() => {
    let now = new Date().getTime();
    let startDate = Date.parse(time);
    let distance = startDate - now;
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    hours < 10 ? hours = "0" + hours : hours;
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    minutes < 10 ? minutes = "0" + minutes : minutes;
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    seconds < 10 ? seconds = "0" + seconds : seconds;
    el.innerText = hours + ":" + minutes + ":" + seconds;
    if (battleData.status[3].time != time) {
      clearInterval(timer);
      el.innerText = "";
      el.setAttribute('hidden', true);
    }
    if (distance < 0 && !concluded) {
      clearInterval(timer);
      el.innerText = "System auto-attack";
      el.setAttribute('hidden', true);
    }
    if (concluded) {
      clearInterval(timer);
      el.innerText = "battle concluded";
      el.setAttribute('hidden', true);
    }
  }, 1000);
}
