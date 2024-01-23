const messageBox = document.getElementById('message-box');
const inputBox = document.getElementById("input-box");
const messages = [];

function updateMessageBox() {
    if (messages.length === 0) {
        inputBox.placeholder = "Enter a message here...";
        return;
    }
    let prev = null;
    let newHTML = '';
    messages.forEach((message) => {
        const newBlock = prev !== message.from;
        if (newBlock) {
            if (prev !== null)
                newHTML += '</div>';
            newHTML += `<div class="message-group ${message.from === username ? 'me' : ''}">`;
        }
        const messageHTML = `<div class="message">`
            + message.text
            + `${message.verified ? '' : ' (UNVERIFIED)'}`
            + '</div>';
        newHTML += messageHTML;
        prev = message.from;
    });
    newHTML += '</div>';
    messageBox.innerHTML = newHTML;
    messageBox.scrollTop = messageBox.scrollHeight;
}

function typeText(event) {
    let key = event.keyCode;
    if (key === 13 && inputBox.value !== '') {
        event.preventDefault();
        inputBox.placeholder = '';
        sendMessage(inputBox.value);
        inputBox.value = '';
    }
}
inputBox.addEventListener('keydown', typeText);

updateMessageBox();