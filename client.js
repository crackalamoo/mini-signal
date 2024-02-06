const P = randomPrime(Math.pow(2, 8), Math.pow(2, 12));
const Q = randomPrime(Math.pow(2, 8), Math.pow(2, 12));
const PHI = (P-1) * (Q-1);
const N = localStorage.getItem('pk_n') || P * Q;
const E = localStorage.getItem('pk_e') || randomCoprime(PHI, PHI);
const D = localStorage.getItem('pk_d') || modInv(E, PHI);

const websocket = new WebSocket("ws://localhost:8000/");

const username = localStorage.getItem('username') || prompt("Enter your username:","") || location.port;
localStorage.setItem('username', username);
localStorage.setItem('pk_n', N);
localStorage.setItem('pk_e', E);
localStorage.setItem('pk_d', D);

users[username] = {
    'pk_n': N, 'pk_e': E
}

function connectUser(user) {
    const event = {
        'type': 'connect',
        'to': user
    };
    websocket.send(JSON.stringify(event));
}

function encryptMessage(text, to) {
    const iv = Math.floor(Math.random() * Math.pow(2, 16));
    const enc = [];
    let v = iv;
    for (let i = 0; i < text.length; i++) {
        let plain = text.codePointAt(i);
        let cipher = expMod(plain ^ v, users[to]['pk_e'], users[to]['pk_n']);
        enc.push(cipher);
        v = cipher + 0;
    }
    return new Array(enc, iv);
}
function decryptMessage(enc, iv) {
    const dec = [];
    let v = iv;
    for (let i = 0; i < enc.length; i++) {
        dec.push(expMod(enc[i], D, N) ^ v);
        v = enc[i] + 0;
    }
    let text = '';
    for (let i = 0; i < dec.length; i++) {
        try {
            text += String.fromCodePoint(dec[i]);
        } catch (e) {
            text += '?';
        }
    }
    return text;
}

async function signMessage(enc) {
    const h = await sha256(enc, N);
    return expMod(h, D, N);
}
async function verifyMessage(message) {
    const user_n = users[message.from]['pk_n'];
    const user_e = users[message.from]['pk_e'];
    const h = await sha256(message.ciphertext, user_n);
    const hp = expMod(message.signature, user_e, user_n);
    return h === hp;
}

let willSend = null;
let willReceive = null;
async function sendMessage(text) {
    const recipient = currentConvo;
    if (users[recipient] === undefined) {
        willSend = text;
        connectUser(recipient);
    } else {
        const enc_iv = encryptMessage(text, recipient);
        const ciphertext = enc_iv[0];
        const iv = enc_iv[1];
        const signature = await signMessage(ciphertext);
        const message = {
            'from': username, 'to': recipient,
            'ciphertext': ciphertext,
            'iv': iv,
            'signature': signature
        };
        messages.push({
            'from': username, 'to': recipient,
            'text': text,
            'verified': true
        });
        websocket.send(JSON.stringify({
            'type': 'msg', ...message
        }));
        updateMessageBox(currentConvo);
    }
}

async function receiveData({data}) {
    const event = JSON.parse(data);
    switch (event.type) {
        case 'msg':
            if (event.to === username) {
                if (users[event.from] === undefined) {
                    connectUser(event.from);
                    willReceive = event;
                } else {
                    willReceive = null;
                    const verified = await verifyMessage(event);
                    messages.push({
                        'from': event.from, 'to': event.to,
                        'text': decryptMessage(event.ciphertext, event.iv),
                        'verified': verified
                    });
                    updateMessageBox(currentConvo);
                }
            }
            break;
        case 'connected':
            if (event.from === username) {
                users[event.to] = {
                    'pk_n': event.pk_n,
                    'pk_e': event.pk_e
                };
                setConvo(event.to);
                if (willSend !== null) {
                    sendMessage(willSend);
                    willSend = null;
                }
                if (willReceive !== null) {
                    const verified = await verifyMessage(willReceive);
                    messages.push({
                        'from': willReceive.from, 'to': willReceive.to,
                        'text': decryptMessage(willReceive.ciphertext, willReceive.iv),
                        'verified': verified
                    });
                    willReceive = null;
                    updateMessageBox(currentConvo);
                }
                updateContactsBox();
            }
            break;
        case 'disconnected':
            if (users[event.user] !== undefined) {
                delete users[event.user];
                updateContactsBox();
            }
            break;
        default:
            break;
    }
}
websocket.addEventListener("message", receiveData);

function onLogin() {
    const event = {
        'type': 'login',
        'user': username,
        'pk_n': N,
        'pk_e': E
    };
    websocket.send(JSON.stringify(event));
}
websocket.addEventListener("open", onLogin);