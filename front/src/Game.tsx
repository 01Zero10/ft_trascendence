import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Student } from "./App";
import "./Game.css"
import { LeadGrid } from "./game_comp/components/LeadGrid";
import PlayGround from "./game_comp/PlayGround";

export default function Game(props: any) {
    const contextData = useContext(Student)
    const [play, setPlay] = useState(false)
    const [socket, setSocket] = useState<Socket | null>(null);

    useLayoutEffect(() => {
        const newSocket = io(`http://${process.env.REACT_APP_IP_ADDR}:3001/game`, { query: { username: contextData.username } });
        newSocket.on('connect', () => {
            setSocket(newSocket);
        })
        return () => {
            newSocket.disconnect();
        }
    }, []);

    return (
        <div className="game_container">
            <div className="fake_navbar">
            </div>
            {!play ? <LeadGrid setPlay={setPlay}></LeadGrid> :
                <div className="playground">
                    <PlayGround socket={socket}></PlayGround>
                </div>}
        </div>
    )
}