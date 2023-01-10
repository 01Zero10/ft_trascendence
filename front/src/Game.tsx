import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Student } from "./App";
import "./Game.css"
import { LeadGrid } from "./game_comp/components/LeadGrid";
import PlayGround from "./game_comp/PlayGround";
import Navigation from "./Navigation";

export interface RunningMatches {
    playRoom: string;
    typo: string;
    player1: string;
    player2: string;
}

type Point = {
    left: number
    right: number
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
    const [point, setPoint] = useState<Point>({
        left: 0,
        right: 0
    })
    const [loader, setLoader] = useState<boolean>(true);
    const [gameOptions, setGameOptions] = useState<{ type: string, opponent?: string }>({ type: "" })
    
    async function checkInvite() {
        const API_URL_CHECK_INVITE = `http://${process.env.REACT_APP_IP_ADDR}:3001/game/checkInvite/${contextData.username}`;
        const ret = await fetch(API_URL_CHECK_INVITE, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        }).then(async (response) => await response.json())
        .catch(() => {return null});
        if(ret){
            if (contextData.username === ret.leftSide || (contextData.username === ret.rightSide && ret.invited === 'accepted')) {
                socket?.emit('connectToInviteGame', { client: contextData.username, playRoom: ret.playRoom, side: (contextData.username === ret.leftSide) ? 'left' : 'right'})
                setGameData({roomName: ret.playRoom, leftPlayer: ret.leftSide, rightPlayer: ret.rightSide});
                setPlay(true);
            }
        }
    }

    // async function removeNotif() {
    //     const API_URL_REMOVE_NOTIF = `http://${process.env.REACT_APP_IP_ADDR}:3001/navigation/removeNotif/${contextData.username}`;
    //     await fetch(API_URL_REMOVE_NOTIF, {
    //         credentials: 'include',
    //         headers: { 'Content-Type': 'application/json' },

    //     }).then();
    // }

    async function handleSetPlay(state: boolean) {
        socket?.emit('connectToGame', { username: contextData.username, avatar: contextData.avatar, type: gameOptions.type });
        setPlay(true);
    }

    useLayoutEffect(() => {
    if (contextData.id !== 0 && contextData.username !== null && contextData.username !== "" && contextData.username !== undefined){
        const newSocket = io(`http://${process.env.REACT_APP_IP_ADDR}:3001/game`, { query: { username: String(contextData.username) }, forceNew: true });
        newSocket.on('connect', () => {
            setSocket(newSocket);
        })
        return () => {
            newSocket.disconnect();
        }
        }
    }, [contextData.username]);

    useEffect(() => {
        if (socket?.id)
            checkInvite();
    }, [socket?.id])

    useEffect(() => {
        socket?.on('dropQueue', async() => {
            setPlay(false);
            setGameData({
                roomName:"",
                leftPlayer:"",
                rightPlayer:""
            })
            socket.emit('removeNotif');
        })
    }, [socket])

    return (
        <><Navigation />
        <div className="game_container">
            <div className="fake_navbar">
            </div>
            {!play ? <LeadGrid checkInvite={checkInvite} gameOptions={gameOptions} setGameOptions={setGameOptions} socket={socket} setGameData={setGameData} setPlay={setPlay} handleSetPlay={handleSetPlay} point={point} setPoint={setPoint} loader={loader} setLoader={setLoader} ></LeadGrid> :
                <div className="playground">
                    <PlayGround gameData={gameData} socket={socket} setGameData={setGameData} point={point} setPoint={setPoint} loader={loader} setLoader={setLoader} ></PlayGround>
                </div>}
        <div className='_prv_'></div>
        </div>
        </>
    )
}