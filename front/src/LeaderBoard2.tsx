import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

export default function LeaderBoard2() {
    let gameSocket: Socket;

    useEffect(() => {
        gameSocket = io(`http://${process.env.REACT_APP_IP_ADDR}:3001/game`);
        return () => {
            gameSocket.disconnect();
        }
    }, []);

    useEffect(() => {
        gameSocket?.on('ciao', () => {
        })
    }, [])
    return (<></>);
}