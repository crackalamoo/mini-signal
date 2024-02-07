const messageBox = document.getElementById('message-box');
const inputBox = document.getElementById("input-box");
const contactsBox = document.getElementById('contacts-box');
const messages = [];
const users = {};
let currentConvo = '';

function updateMessageBox(user=null) {
    // update the message box to show all messages that have been sent and received between us and user
    const fmessages = messages.filter((message) => (user === null
        || (message.from === username && message.to === user)
        || (message.from === user && message.to === username)));
    if (fmessages.length === 0) {
        inputBox.placeholder = "Enter a message here...";
        messageBox.innerHTML = '';
        return;
    }
    let prev = null;
    let newHTML = '';
    fmessages.forEach((message) => {
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
const setConvo = (user) => {
    currentConvo = user;
    updateMessageBox(user);
    updateContactsBox();
}
function displayUsername() {
    document.getElementById("username").text = username;
}

function updateContactsBox() {
    if (contactsBox === null)
        return;
    let newHTML = '';
    for (const [key, val] of Object.entries(users)) {
        if (key !== username)
            newHTML +=
                `<span class="contact ${key === currentConvo ? 'active':''}" onClick="setConvo('${key}')">`
                + key
                + '</span>';
    }
    newHTML += '<span class="contact" onclick="addContact()">+</span>';
    contactsBox.innerHTML = newHTML;
}

function addContact() {
    const user = prompt("Enter username of new contact:", "");
    if (user === "") return;
    connectUser(user);
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
updateContactsBox();