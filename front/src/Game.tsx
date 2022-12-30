import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Student } from "./App";
import "./Game.css"
import { LeadGrid } from "./game_comp/components/LeadGrid";
import PlayGround from "./game_comp/PlayGround";

export interface RunningMatches {
    playRoom: string;
    typo: string;
    player1: string;
    player2: string;
}


export default function Game() {
    const contextData = useContext(Student)
    const [play, setPlay] = useState(false)
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameData, setGameData] = useState<{roomName: string, leftPlayer: string, rightPlayer: string}>({
        roomName:"",
        leftPlayer:"",
        rightPlayer:""
    })
    
    async function checkInvite() {
        const API_URL_CHECK_INVITE = `http://${process.env.REACT_APP_IP_ADDR}:3001/game/checkInvite/${contextData.username}`;
        const ret = await fetch(API_URL_CHECK_INVITE, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        }).then(async (response) => await response.json())
        .catch(() => {return null});
        if(ret){
            console.log('checkInviteFront');
            if (contextData.username === ret.leftSide || (contextData.username === ret.rightSide && ret.invited === 'accepted')) {
                console.log("ciao", ret.playRoom, ret.leftSide, ret.rightSide);
                socket?.emit('connectToInviteGame', { client: contextData.username, playRoom: ret.playRoom, side: (contextData.username === ret.leftSide) ? 'left' : 'right'})
                setGameData({roomName: ret.playRoom, leftPlayer: ret.leftSide, rightPlayer: ret.rightSide});
                setPlay(true);
            }
            console.log(gameData);
        }
    }

    async function handleSetPlay(state: boolean) {
        socket?.emit('connectToGame', { username: contextData.username, avatar: contextData.avatar });
        setPlay(true);
    }

    useLayoutEffect(() => {
        const newSocket = io(`http://${process.env.REACT_APP_IP_ADDR}:3001/game`, { query: { username: contextData.username } });
        newSocket.on('connect', () => {
            setSocket(newSocket);
        })
        return () => {
            newSocket.disconnect();
        }
    }, [contextData.username]);

    useEffect(() => {
        if (socket?.id)
            checkInvite();
    }, [socket?.id])

    return (
        <div className="game_container">
            <div className="fake_navbar">
            </div>
            {!play ? <LeadGrid socket={socket} setGameData={setGameData} setPlay={handleSetPlay}></LeadGrid> :
                <div className="playground">
                    <PlayGround gameData={gameData} socket={socket} setGameData={setGameData}></PlayGround>
                </div>}
        </div>
    )
}