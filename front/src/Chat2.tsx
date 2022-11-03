import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import './Chat.css';
import { io, Socket } from 'socket.io-client';
import { Student } from './App';
import AsyncSelect from 'react-select/async';
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';

export interface packMessage {
  id: number;
  username: string;
  userSocket: string;
  room: string;
  message: string;
}

export interface UsersOnDB {
  username: string;
}

const Messages = (props: any) => {
  return (
    props.data.map(
      (m: any) => m[0] !== '' ? (
        <li key={m[0]}><strong>{m[0]}</strong> : <div className="innermsg">{m[1]}</div></li>
      ) : (
        <li className="update" key={m[1]}>{m[1]}</li>
      ))
  )
}

const Online = (props: any) => {
  return (
    props.data.map((m: any) => <li id={m[0]} key={m[0]}>{m[1]}</li>)
  )
}

let options_: { label: string, value: string }[] = [];

export const SocketContext = React.createContext<Socket | null>(null);

function Chat() {

  const [optLoad, setOptLoad] = useState(false);

  const contextData = useContext(Student);
  //console.log(contextData.socket_id);
  //const name: string = contextData.username; //va messo Nickname?

  const [loggedIn, setLoggedIn] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  let online: [] = [];
  const [room, setRoom] = useState('Black');
  const [input, setInput] = useState('');
  const initialArray = [["name, message"]];
  const [messages, setMessages] = useState(initialArray);

  async function getUsersOnDB() {
    let respose = await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getuod`);
    let data = await respose.json();

    data.forEach((element: any) => {
      let dropDown = { label: element.username, value: element.username };
      if (!options_[element.username])
        options_.push(dropDown);
    });
    //console.log(options_);
    //console.log(typeof (options_));
    setOptLoad(true);
  }

  let flagToDelete = true;

  useEffect(() => {
    //console.log('name= ', contextData.username)
  }, [contextData.username]);

  useEffect(() => {
    //console.log('room= ', room)
  }, [room]);

  useEffect(() => {
    //console.log('input= ', input)
  }, [input]);

  const setChrono = async (data: string) => {
    //console.log("joined room " + data);
    await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/chat/chrono/${data}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => {
        response.json().then(pack => {
          pack.forEach((element: packMessage) => {
            //console.log(element.username, "", element.message);
            setMessages(messages => [...messages, [element.username, element.message]]);
          });
        })
      })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoggedIn(true);
    //socket?.connect();
    //console.log("handle submit");
    //console.log(socket?.id);
    socket?.emit(
      'addUser',
      { usr: contextData.username },
      (data: string) => console.log("new user: " + data)
    );
    socket?.emit(
      'joinRoom',
      { room: room },
      (data: string) => setChrono(data)
    );
  };

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket?.emit(
      'msgToServer',
      { room: room, name: contextData.username, message: input },
      (data: any) => console.log("handleSend: ",data)
    );
    setInput('');
  };

  useEffect(() => {
    const url = `http://${process.env.REACT_APP_IP_ADDR}:3001`;
    //const newSocket: Socket = io(url, { autoConnect: false, query: { userID: String(contextData.id) } });
    //const socket: Socket = io(url, { autoConnect: false });
    const newSocket = io(`http://${process.env.REACT_APP_IP_ADDR}:3001`, { query: { userID: String(contextData.id) } });
    newSocket.on('connect', () => {
      setSocket(newSocket);
      contextData.socket_id = newSocket.id;
      //console.log(newSocket.id);
      //console.log(contextData.socket_id);
    })
    //setSocket(newSocket);
    //console.log(newSocket.id);
    //socket?.connect();
    getUsersOnDB();
  }, []);

  useEffect(() => {
    socket?.on('newUser', (usr_name: string) => {
      //console.log(usr_name + " connected.");
    });
    socket?.on('lostUser', (usr_name: string) => {
      //console.log(usr_name + " disconconnected.");
    });
    socket?.on('joinedRoom', (usr_room: string) => {
      setRoom(usr_room);
      //console.log(usr_room + " entered.");
    });
    socket?.on('leftRoom', (usr_name: string) => {
      //console.log(usr_name + " exited.");
    });
    socket?.on('msgToClient', (client_message: { room: string, name: string, message: string }) => {
      //console.log("received from server: ", client_message);
      setMessages(messages => [...messages, [client_message.name, client_message.message]]);
    });
    socket?.on('disconnect', () => {
      socket?.emit('deleteUser', { usr: contextData.username }, (data: string) => console.log(data));
    })
  }, [socket]);

  return (
    loggedIn === true ? (
      <section className='Chat-Area'>
        <ul id='messages'>
          <Messages data={messages} />
        </ul>
        <ul id="online">
          &#x1f310; : <Online data={online} />
        </ul>
        <div id='sendform'>
          <form onSubmit={handleSend}>
            <input
              id='message_input'
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
              placeholder='type your message ..'
            />
            <button> Send </button>
          </form>
        </div>
      </section>
    ) : (
      <div className='Chat-Entry'>
        <form onSubmit={handleSubmit}>
          <input
            id='name_input'
            type='text'
            defaultValue={contextData.username}
            required
            readOnly
            placeholder='What is your name ..'
          />
          <br />
          <Select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          >
            {options_ && options_.map((option) => (
              <MenuItem key={option.value} value={option.value} >
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <br />
          <button>Submit</button>
        </form>
      </div>
    )
  );
}
export default Chat;