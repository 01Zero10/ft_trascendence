const socket = io("http://localhost:3000/chat", {transports: ['websocket']} )
// parameter: url of websocket backend
// https://socket.io/docs/v4/server-api/#socket
// https://socket.io/docs/v4/client-initialization/
// https://socket.io/docs/v4/client-socket-instance/

const client_name_i = document.getElementById('client_name');
const client_message_i = document.getElementById('client_message');
const private_name_i = document.getElementById('private_name');
const private_message_i = document.getElementById('private_message');
const display_status = document.getElementById('RoomStatus');
const display_user_history = document.getElementById('user_history');
const display_messages_red = document.getElementById('display_Red_messages');
const display_message_private = document.getElementById('display_Private_messages');
const button_send = document.getElementById('client_send');
const button_send_private = document.getElementById('private_send');
const button_quit = document.getElementById('QuitRoom');
const button_join_red = document.getElementById('JoinRed');

const username = prompt('Enter your username: ');

let client_room = "Black";

socket.on('connect', () => {
  //socket.emit('joinRoom', {room: "Red"}, (data) => console.log(username + " joined room " + data));
  socket.emit('checkUser', {usr: username}, (data) => console.log(username + "trying to auth.."));

  const password = prompt('Enter your password: ');
  socket.emit('addUser', {usr: username, psw: password}, (data) => console.log("new user: " + data));
});

socket.on('newUser', ( name ) => {
  if (name){
    display_user_history.appendChild(addMessageLine(name + " connected."));
    //console.log("joined: ", name);
  }else
     //console.log("can't join: ", name);
});

socket.on('joinedRoom', (data) => {
  client_room = data;
  display_status.appendChild(addMessageLine(client_room));
});

socket.on('disconnect', () => {
  socket.emit('deleteUser', {usr: username}, (data) => console.log(data));
})

socket.on('lostUser', ( name ) => {
  display_user_history.appendChild(addMessageLine(name + " disconnected."));
});

button_quit.addEventListener("click", () => {
  if (client_room) {
    socket.emit('leaveRoom', {room: client_room}, (data) => console.log("left room: " + data));
  } else {
    alert('You do not belong to any chatroom currently!');
  }
});

socket.on('leftRoom', ( data ) => {
  client_room = "";
  display_status.appendChild(addMessageLine("Null"));
});

button_join_red.addEventListener("click", () => {
  if (!client_room) {
    socket.emit('joinRoom', {room: "Red"}, (data) => console.log("joined room: " + data));
  } else {
    alert('You already belong to the Red chatroom!');
  }
});

button_send.addEventListener("click", () => {
  if (client_room) {
    input = {room: client_room, name: client_name_i.value, message: client_message_i.value};
    socket.emit('msgToServer', input, (data) => console.log(data));
  } else {
    alert('You must be a member of the active room to send messages!');
  }
  client_name_i.value = "";
  client_message_i.value = "";
});

socket.on('msgToClient', (client_message) => {
  //console.log(client_message);
  display_messages_red.appendChild(addMessageLine(client_message.message));
});

button_send_private.addEventListener("click", () => {
  input_private = {name: private_name_i.value, message: private_message_i.value};
  socket.emit('msgPrivateToServer', input_private, (data) => console.log(data));
  private_name_i.value = "";
  private_message_i.value = "";
});

socket.on('msgPrivateToClient', (private_message) => {
  //console.log(private_message);
  display_message_private.appendChild(addMessageLine(private_message.message));
});

const addMessageLine = (message) => {
  const newLine = document.createElement("li");
  newLine.appendChild(document.createTextNode(message));
  return newLine;
};
