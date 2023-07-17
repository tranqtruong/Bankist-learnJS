'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];


// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

var currentAccount;

// handler login
btnLogin.addEventListener('click', handleLogin);

function handleLogin(event){
  event.preventDefault();

  if(!isUserAuthenticated()){
    showMessage('Login information is incorrect!');
    return;
  }

  updateUI();
  handleTimer();
}

function isUserAuthenticated(){
  currentAccount = getUserAccount(inputLoginUsername.value);
  if(currentAccount?.pin !== Number(inputLoginPin.value)){
    currentAccount = undefined;
  }
  return !!currentAccount;
}

function getUserAccount(username){
  return accounts.find((account) => {
    if(getUsername(account.owner) === username){
      account.username = username;
      return true;
    }
    return false;
  }
  )
}

function getUsername(owner){
  return owner.split(' ').map(word => word.at(0)).join('').toLowerCase();
}

function displayContainerApp(){
  containerApp.style.opacity = 1;
}

function displayWelcomeMessage(){
  labelWelcome.innerHTML = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
}

function displayMovements(account, isSort = false){
  let movements = account.movements.map((mov, index) => {
    return {
      amount: mov,
      date: account.movementsDates[index]
    }
  });

  movements = isSort ? movements.sort((a, b) => a.amount - b.amount) : movements;

  containerMovements.innerHTML = '';

  movements.forEach((movement, index) => {
      let movementType = (movement.amount > 0) ? 'deposit' : 'withdrawal';
      let date = new Date(movement.date);
      let dateFormated = formatDate(date);
      let htmlMovement = `
        <div class="movements__row">
          <div class="movements__type movements__type--${movementType}">${index+1} ${movementType}</div>
          <div class="movements__date">${dateFormated}</div>
          <div class="movements__value">
            ${Intl.NumberFormat(account.locale, {style: 'currency', currency: account.currency})
              .format(movement.amount)}
          </div>
        </div>
      `;
      containerMovements.insertAdjacentHTML('afterbegin', htmlMovement);
  });
}

function displayCurrentBalance(account){
  account.balance = account.movements.reduce((acc, mov) => {
    return acc + mov;
  }, 0);

  let balance = Number.isInteger(account.balance) ? account.balance : account.balance.toFixed(2);
  labelBalance.innerHTML = `${Intl.NumberFormat(account.locale, {style: 'currency', currency: account.currency}).format(balance)}`;
}

function displaySumInMovement(account){
  account.sumInMovement = account.movements
      .filter(movement => movement > 0)
      .reduce((acc, mov) => acc + mov, 0);

  let sumIn = account.sumInMovement;
  sumIn = Number.isInteger(sumIn) ? sumIn : sumIn.toFixed(2);
  labelSumIn.innerHTML = `${Intl.NumberFormat(account.locale, {style: 'currency', currency: account.currency}).format(sumIn)}`;
}

function displaySumOutMovement(account){
  account.sumOutMovement = Math.abs(
    account.movements
      .filter(movement => movement < 0)
      .reduce((acc, mov) => acc + mov, 0)
  );
  
  let sumOut = account.sumOutMovement;
  sumOut = Number.isInteger(sumOut) ? sumOut : sumOut.toFixed(2);
  labelSumOut.innerHTML = `${Intl.NumberFormat(account.locale, {style: 'currency', currency: account.currency}).format(sumOut)}`;
}

function displayInterestMovement(account){
  account.sumInterestMovement = account.movements
      .filter(movement => movement > 0)
      //.map(mov => mov * (1.2/100))
      .reduce((acc, mov) => acc + (mov * (account.interestRate/100)), 0);

  let interest = account.sumInterestMovement;
  interest = Number.isInteger(interest) ? interest : interest.toFixed(2);
  labelSumInterest.innerHTML = `${Intl.NumberFormat(account.locale, {style: 'currency', currency: account.currency}).format(interest)}`;
}

function updateUI(){
  displayContainerApp();
  displayWelcomeMessage();
  displayCurrentDate();
  displayCurrentBalance(currentAccount);
  displayMovements(currentAccount);
  displaySumInMovement(currentAccount);
  displaySumOutMovement(currentAccount);
  displayInterestMovement(currentAccount);
  resetInput();
}

function resetInput(){
  inputLoginUsername.value = '';
  inputLoginPin.value = '';
  inputTransferTo.value = '';
  inputTransferAmount.value = '';
  inputLoanAmount.value = '';
  inputCloseUsername.value = '';
  inputClosePin.value = '';
}

function displayCurrentDate(){
  let date = new Date();
  let dateString = Intl.DateTimeFormat('en-US', 
  {day: '2-digit', month: '2-digit', year: 'numeric'}).format(date);
  labelDate.textContent = `${dateString}`;
}

function formatDate(date){

  let subtractionResult = minusTwoDate(new Date(), date);

  if(subtractionResult === 0){
    return 'Today';
  }

  if(subtractionResult === 1){
    return 'Yesterday';
  }

  if(subtractionResult <= 7){
    return `${subtractionResult} days ago`;
  }

  let day = date.getDate();
  day = ((day < 10) ? '0' : '') + day;
  const month = `${date.getMonth()+1}`.padStart(2, 0);
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function minusTwoDate(date1, date2){
  return Math.abs(
    Math.round( (date1 - date2) / (24 * 60 * 60 * 1000) )
  );
}

// handler transfer money
var receiverAccount;

btnTransfer.addEventListener('click', handleTranferMoney);

function handleTranferMoney(event){
  event.preventDefault();

  const tranferAmount = Number(inputTransferAmount.value);
  let receiverName = inputTransferTo.value

  if(!isEnoughMoney(tranferAmount)){
    return;
  }

  if(!isReceiverValid(receiverName)){
    showMessage('Recipient account does not valid!');
    return;
  }
  
  currentAccount.movements.push(-tranferAmount);
  currentAccount.movementsDates.push(new Date().toISOString());

  receiverAccount.movements.push(tranferAmount);
  receiverAccount.movementsDates.push(new Date().toISOString());

  updateUI();
}

function isEnoughMoney(tranferAmount){
  let balance = currentAccount?.balance;

  try {

    if(tranferAmount <= 0){
      throw new Error('Tranfer amount cannot be negative.')
    }

    if(!balance){
      throw new Error('Please login again and try again later.');
    }

    if(balance < tranferAmount){
      throw new Error('The balance is not enough to make the transaction!');
    }

    if(balance <= 2){
      throw new Error('Minimum balance is 2€ to keep the account active!')
    }
  } catch (error) {
    showMessage('Transaction failed! ' + error.message);
    return false;
  }

  return true;
}

function showMessage(message){
  alert(message);
}

function isReceiverValid(receiverName){
  if(currentAccount?.username === receiverName){
    return false;
  }
  receiverAccount = getUserAccount(receiverName);
  return !!receiverAccount;
}


// handler request loan
btnLoan.addEventListener('click', handleRequestLoan);

function handleRequestLoan(event){
  event.preventDefault();

  const loanAmount = Number(inputLoanAmount.value);

  if(loanAmount <= 0){
    showMessage('Loan amount can not be negative');
    return;
  }

  if(!isAllowedBorrowMoney(loanAmount)){
    showMessage('loan amount is too large');
    return;
  }

  setTimeout(() =>{
    currentAccount.movements.push(loanAmount);
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI();
  }, 10000);

}

function isAllowedBorrowMoney(loanAmount){
  return currentAccount.movements.some(mov => mov > loanAmount*0.1);
}


// handler close account
btnClose.addEventListener('click', handleCloseAccount);

function handleCloseAccount(event){
  event.preventDefault();

  const username = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);

  if(!isCorrectAuthentication(username, pin)){
    showMessage('username or pin incorrect!');
    return;
  }

  closeAccount();
  
  containerApp.style.opacity = 0;
}

function isCorrectAuthentication(username, pin){
  return username === currentAccount.username && pin === currentAccount.pin;
}

function closeAccount(){
  const accountIndex = accounts.findIndex(acc => acc.username === currentAccount.username);
  accounts.splice(accountIndex, 1);
}


// sort movements
btnSort.addEventListener('click', handleSort);

var sorted = false;

function handleSort(){
  sorted = !sorted;
  displayMovements(currentAccount, sorted);
}


// timmer

function handleTimer(){
  var minutes = 2;
  var seconds = 0;

  var timmerId = setInterval(() => {
    let time = `0${minutes}:${((seconds < 10) ? '0' : '') + seconds}`;
    labelTimer.textContent = time;

    if(Math.trunc(seconds) === 0){
      minutes--;
    }

    if(Math.trunc(minutes) < 0){
      minutes = 2;
      seconds = 0;
      currentAccount = undefined;
      containerApp.style.opacity = 0;
      clearInterval(timmerId);
    }

    seconds--;

    if(seconds < 0){
      seconds = 59;
    }
  }, 1000);
}