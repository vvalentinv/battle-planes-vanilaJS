
let welcome = document.getElementById('welcome');
let welcomeUser = document.getElementById('welcome-user');
let loginStatusButton = document.getElementById('login-status');
let header3 = document.getElementById('header3');
let header2 = document.getElementById('header2');
let unchallengedBattles = document.getElementById('unchallenged-battles');
let setDefense = document.getElementById('set-defense');
let tbody = document.getElementById('battle-tbl-tbody');
let submitButton = document.getElementById('submit-btn');
let cancelButton = document.getElementById('cancel-btn');
let filter = document.getElementById('filter');
let error = document.getElementById('error-message');
let serverError = document.getElementById('sever-error');
let success = document.getElementById('success-messages');
let amount = document.getElementById('amount');
let description = document.getElementById('description');
let category = document.getElementById('category');
let receipt = document.getElementById('receipt');
let url = `http://127.0.0.1:5000`
let data = null;

const grabDataAndFeedtoPage = async () => {
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
        unchallengedBattles.innerHTML = '';
        setDefense.removeAttribute('hidden');
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

window.addEventListener('popstate', grabDataAndFeedtoPage);

document.addEventListener("DOMContentLoaded", grabDataAndFeedtoPage);

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

header2.addEventListener('click', () => {
  newReimb.removeAttribute('hidden');
})

cancelButton.addEventListener('click', () => {
  newReimb.setAttribute('hidden', true);
  receipt.value = '';
  description.value = '';
  amount.value = '';
  category.value = 0;
  while (tbody.hasChildNodes()) {
    tbody.removeChild(tbody.lastChild);
  }
})

submitButton.addEventListener('click', async () => {

  if (!amount.value || !description.value || category.value == 0 || receipt.value == '') {
    error.innerText = "All fields are mandatory to submit a new request for reimbursement!";
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

function addBattlesToTable(data) {
  for (b of data.battles) {
    let row = document.createElement('tr');

    let playerName = document.createElement('td');
    playerName.innerHTML = `<select name="accept-challenge-in-row" class="filter-in-row"> <option class="accepted dropdown-item" value=1` +
      `>` + b[1] + `</option> <option class="accepted dropdown-item" value="` + b[0] + `">Accept Challenge</option>`;    // playerName.innerHTML = b[1];
    let defenseSize = document.createElement('td');
    defenseSize.innerHTML = b[2];
    // let status_nameCell = document.createElement('td');

    // if (reimb.status_name == "pending") {
    //   status_nameCell.innerHTML = reimb.status_name;
    // } else if (reimb.status_name == "denied") {
    //   status_nameCell.innerHTML = reimb.status_name;
    //   status_nameCell.style.color = 'red';
    // } else if (reimb.status_name == "approved") {
    //   status_nameCell.innerHTML = reimb.status_name;
    //   status_nameCell.style.color = 'green';
    // }
    let skySize = document.createElement('td');
    skySize.innerHTML = b[3];
    // let descriptionCell = document.createElement('td');
    // descriptionCell.innerHTML = reimb.description;
    // let resolverCell = document.createElement('td');
    // if (reimb.resolver)
    //   resolverCell.innerHTML = reimb.resolver;
    // let imageCell = document.createElement('td');
    // let aElement = document.createElement('a');
    // aElement.setAttribute('href', reimb.receipt);
    // aElement.setAttribute('target', "_Blank");
    // aElement.innerText = 'view receipt'
    // imageCell.appendChild(aElement);

    row.appendChild(playerName);
    row.appendChild(defenseSize);
    row.appendChild(skySize);

    tbody.appendChild(row);
  }
}
