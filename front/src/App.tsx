import React, { Children, Component, createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";
import Home from './Home';
import About from './About';
import Navigation from './Navigation';
import Game from './Game';
import Logout from './Logout';
import Login from './Login';
//import Account from './Account';
import Settings from './Settings';
import Chat from './Chat';
import Loader from './components/Loader';
import { io, Socket } from 'socket.io-client';
import Account from './Account';

export interface Rooms {
  name: string;
  type: string;
  builder: { username: string };
}

export interface student {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  two_fa_auth: boolean;
  rooms?: Rooms[];
  twoFaAuthSecret?: string;
  socket_id?: string;
  points: number;
  wins: number;
  losses: number;
}

export const Student = createContext<student>({
  id: 0,
  username: "",
  nickname: "",
  avatar: "",
  socket_id: undefined, //
  rooms: undefined, //
  two_fa_auth: false,
  twoFaAuthSecret: undefined,
  points: 0,
  wins: 0,
  losses: 0,
});

function App() {


  const [contextData, setcontextData] = useState<student>({
    id: 0,
    username: "",
    nickname: "",
    avatar: "",
    two_fa_auth: false,
    twoFaAuthSecret: undefined,
    points: 0,
    wins: 0,
    losses: 0,
  });


  const API_URL = `http://${process.env.REACT_APP_IP_ADDR}:3001/user`
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const getUserInfo = async () => {
      await fetch(API_URL, {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((result) => {
          setcontextData({
            id: result.id,
            username: result.username,
            nickname: result.nickname,
            avatar: result.avatar,
            two_fa_auth: result.two_fa_auth,
            points: result.points,
            wins: result.wins,
            losses: result.losses,
          });
          setShowLoader(false);
        })
        .catch((error) => console.log(error));
    }
    getUserInfo();
  }, [])

  const [socket, setSocket] = useState<Socket | null>(null);
  useLayoutEffect(() => {
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
    //getUsersOnDB();
  }, [contextData]);

  const [currPath, setCurrPath] = useState(window.location.pathname)

  useEffect(() => {
    setCurrPath(window.location.pathname)
  }, [])

  return (
    <div className="App">
      <BrowserRouter>
        {showLoader ? <Loader /> :
          <>
            <Student.Provider value={contextData}>
              {currPath !== "/" && <><Navigation /></>}
              {/* {currPath !== "/" && <><Chat2 /></>} */}

              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path={`/users/:user_id`} element={<Account />} />
                <Route path="/leaderbord" />
                <Route path="/logout" element={<Logout />} />
                <Route path="/game" element={<Game socket={socket} />} />
                <Route path="/users/settings" element={<Settings />} />
                <Route path="/chat" element={<Chat socket={socket} />} />
              </Routes>
            </Student.Provider>
          </>
        }
      </BrowserRouter>
    </div>
  );
}


export default App;

function sleep(arg0: number) {
  throw new Error('Function not implemented.');
}

