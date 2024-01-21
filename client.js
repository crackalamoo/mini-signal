const P = 199933;
const Q = 16661;
const G = Math.floor(Math.pow(2, (P-1)/Q));

const websocket = new WebSocket("ws://localhost:8000/");
const username = location.port;

const messages = [];
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

function sendMessage(text) {
    const message = {
        'from': username,
        'to': username === '3000' ? '3001' : '3000',
        'text': text
    };
    websocket.send(JSON.stringify({
        'type': 'msg', ...message
    }));
    updateMessageBox();
}

function receiveData({data}) {
    const event_str = JSON.parse(data);
    const event = JSON.parse(event_str);
    console.log(data);
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
        default:
            break;
    }
}
websocket.addEventListener("message", receiveData);

function typeText(event) {
    let key = event.keyCode;
    if (key === 13) {
        event.preventDefault();
        console.log(inputBox.value);
        sendMessage(inputBox.value);
        inputBox.value = '';
    }
}
inputBox.addEventListener('keydown', typeText);