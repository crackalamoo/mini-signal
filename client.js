function randomPrime(maxVal) {
    const isPrime = (num) => {
        for (let i = 2, s = Math.sqrt(num); i <= s; i++)
            if (num % i === 0) return false;
        return num > 1;
    }
    let res = 1;
    while (!isPrime(res)) {
        res = 2 + Math.floor(Math.random() * maxVal);
    }
    return res;
}
function gcd(a, b) {
    if (b === 0) {
        return [a, 1, 0];
    }
    const [g, x, y] = gcd(b, a % b);
    return [g, y, x - Math.floor(a/b) * y];
}
function modInv(a, m) {
    return (gcd(a,m)[1] % m + m) % m;
}
function randomCoprime(coprimeTo, maxVal) {
    let res = coprimeTo;
    while (gcd(res, coprimeTo)[0] !== 1) {
        res = 2 + Math.floor(Math.random() * maxVal);
    }
    return res;
}

const P = randomPrime(Math.pow(2, 12));
const Q = randomPrime(Math.pow(2, 12));
const N = P * Q;
const PHI = (P-1) * (Q-1);
const E = randomCoprime(PHI, PHI);
const D = modInv(E, PHI);

function expMod(base, exp, mod){
    if (exp == 0)
        return 1;
    if (exp % 2 == 0){
        return Math.pow(expMod(base, (exp / 2), mod), 2) % mod;
    } else {
        return (base * expMod(base, (exp - 1), mod)) % mod;
    }
}

const SK = 1 + Math.floor((Q-1)*Math.random());

const websocket = new WebSocket("ws://localhost:8000/");
const username = location.port;

const messages = [];
const users = {};

const messageBox = document.getElementById('message-box');
const inputBox = document.getElementById("input-box");

function updateMessageBox() {
    messageBox.innerHTML = '';
    messages.forEach((message) => {
        const messageHTML =
        `<span class="${message.to === username ? 'me' : ''}">`
            + message.text
            + '</span><br>';
        messageBox.innerHTML += messageHTML;
    });
}

function connectUser(user) {
    const event = {
        'type': 'connect',
        'to': user
    };
    websocket.send(JSON.stringify(event));
}

let willSend = null;
async function sendMessage(text) {
    const recipient = username === '3000' ? '3001' : '3000';
    if (users[recipient] === undefined) {
        willSend = text;
        connectUser(recipient);
    } else {
        const message = {
            'from': username,
            'to': recipient,
            'text': text
        };
        websocket.send(JSON.stringify({
            'type': 'msg', ...message
        }));
        updateMessageBox();
    }
}

function receiveData({data}) {
    console.log(data);
    const event = JSON.parse(data);
    console.log(event);
    console.log(event.type);
    switch (event.type) {
        case 'msg':
            messages.push({
                'from': event.from,
                'to': event.to,
                'text': event.text
            });
            updateMessageBox();
            break;
        case 'connected':
            users[event.to] = {
                'pk_n': event.pk_n,
                'pk_e': event.pk_e
            };
            if (willSend !== null) {
                sendMessage(willSend);
                willSend = null;
            }
            break;
        default:
            break;
    }
}
websocket.addEventListener("message", receiveData);

function login() {
    const event = {
        'type': 'login',
        'user': username,
        'pk_n': N,
        'pk_e': E
    };
    websocket.send(JSON.stringify(event));
}
websocket.addEventListener("open", login);

function typeText(event) {
    let key = event.keyCode;
    if (key === 13) {
        event.preventDefault();
        sendMessage(inputBox.value);
        inputBox.value = '';
    }
}
inputBox.addEventListener('keydown', typeText);