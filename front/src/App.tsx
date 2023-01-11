import React, { Children, Component, createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, BrowserRouter as Router, Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";
import Home from './Home';
import Navigation from './Navigation';
import Game from './Game';
import Logout from './Logout';
import Login from './Login';
//import Account from './Account';
import Settings from './Settings';
import Chat from './Chat';
import Loader from './Loader';
import PageNotFound from './PageNotFound';
import { io, Socket } from 'socket.io-client';
import Account from './Account';
import LeaderBoard from './LeaderBoard';
import { Dialog, Modal } from '@mui/material';
import TwoFactorLogin from './TwoFactorLogin';

export interface Rooms {
  name: string;
  type: string;
  builder: { username: string, nickname?: string };
}

export interface student {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  two_fa_auth: boolean;
  tfa_checked?: boolean;
  blockedUsers?: string[];
  rooms?: Rooms[] | null;
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
  tfa_checked: false,
  twoFaAuthSecret: undefined, //poi vediamo
  blockedUsers: undefined,
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
    tfa_checked: false,
    twoFaAuthSecret: undefined,
    blockedUsers: undefined,
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
            tfa_checked: result.tfa_checked,
            blockedUsers: result.blockedUsers,
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

  // const [socket, setSocket] = useState<Socket | null>(null);
  // useLayoutEffect(() => {
  //   if (contextData.id !== 0) {
  //     const url = `http://${process.env.REACT_APP_IP_ADDR}:3001`;
  //     const newSocket = io(`http://${process.env.REACT_APP_IP_ADDR}:3001`, { query: { userID: String(contextData.id) } });
  //     newSocket.on('connect', () => {
  //       setSocket(newSocket);
  //       contextData.socket_id = newSocket.id;
  //     }
  //     )
  //   }
  // }, [contextData.id]);

  const [currPath, setCurrPath] = useState(window.location.pathname)

  useEffect(() => {
    setCurrPath(window.location.pathname)
  }, [])
  

  function ProtectedRoute ({contextData} : {contextData: student}){
    if (!contextData.id || contextData.id === 0 || contextData.id === null) {
      return <Navigate to={"/"} replace />;
    }
    else if (contextData.two_fa_auth && !contextData.tfa_checked)
      return <Navigate to={"/googleAuth"} replace/>
    return <Outlet />;
  };

  function ProtectedAuthRoute ({contextData} : {contextData: student}){
    if ((contextData.two_fa_auth && contextData.tfa_checked) || !contextData.two_fa_auth)
      return <Navigate to={"/home"} replace/>
    return <Outlet />;
  };

  console.log(contextData)

  return (
    <div className="App">
      <BrowserRouter>
        {showLoader ? <Loader /> :
          <>
            <Student.Provider value={contextData}>
              {/* {currPath !== "/" && <><Navigation /></>} */}
              {/* {currPath !== "/" && <><Chat2 /></>} */}
              
              <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<ProtectedRoute contextData={contextData} />}>
                  <Route path="home" element={<Home />} />
                  <Route path={`/users/:user_id`} element={<Account />} />
                  <Route path="/leaderboard" element={<LeaderBoard />} />
                  <Route path="/logout" element={<Logout />} />
                  <Route path="/game" element={<Game />} />
                  <Route path="/users/settings" element={<Settings />} />
                  <Route path="/chat" element={<Chat />} />
                </Route>
                <Route element={<ProtectedAuthRoute contextData={contextData} />}>
                  <Route path="/googleAuth" element={<TwoFactorLogin setcontextData={setcontextData} />} />
                </Route>
                <Route path='*' element={<PageNotFound />}/>
              </Routes>

              {/* <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path={`/users/:user_id`} element={<Account />} />
                <Route path="/leaderboard" element={<LeaderBoard />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/game" element={<Game />} />
                <Route path="/users/settings" element={<Settings />} />
                <Route path="/chat" element={<Chat />} />
              </Routes> */}
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

