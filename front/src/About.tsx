import React, { useContext, useEffect, useState } from "react"
import ChatHeader from "./components/ChatHeader"
import ChatInput from "./components/ChatInput"
import ChatGroup from "./components/ChatGroup"
import { io, Socket } from "socket.io-client"
import ChatBody from "./components/ChatBody"

import { Modal, Button, Group } from '@mantine/core';

import { Student } from "./App"
import './About.css'

export interface packMessage {
    id: number,
    username: string,
    userSocket: string,
    room: string,
    message: string,
    avatar: string,
    createdAt: Date,
}

function Chat2(props: any) {
    const contextData = useContext(Student);
    //const client_id = contextData.id;
    const [status, setStatus] = React.useState("chiusa");
    const [socket, setSocket] = useState<Socket | null>(null);
    const [input, setInput] = useState('');
    const [stanza, setStanza] = React.useState("");
    const [src, setSrc] = React.useState("");
    const [gruppo, setGruppo] = React.useState(false)

    let options_: string[] = [];

    //console.log("stanza===", stanza);

    const [listUser, setListUser] = useState<string[]>([]);
    const [messages, setMessages] = useState<packMessage[]>([]);


    useEffect(() => {
        const url = `http://${process.env.REACT_APP_IP_ADDR}:3001`;
        //const newSocket: Socket = io(url, { autoConnect: false, query: { userID: String(contextData.id) } });
        //const socket: Socket = io(url, { autoConnect: false });
        const newSocket = io(`http://${process.env.REACT_APP_IP_ADDR}:3001`, {
            reconnectionDelayMax: 10000,
            query: { userID: String(contextData.id) }
        });
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
    }, []);

    useEffect(() => {
        async function getUsersOnDB() {

            //console.log(contextData.id);
            //if (contextData.id != 0) {
            let respose = await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/chat/clientrooms/${contextData.id}`);

            let data = await respose.json();
            let options_: string[] = [];

            data.forEach((element: any) => {
                let dropDown: string = element;
                if (!options_[element]) {
                    options_.push(dropDown);
                    setListUser(options_);
                }
            });
            //}
        }
        getUsersOnDB();
    }, [contextData.id]);

    async function getChatMessages() {
        if (stanza !== "") {
            setMessages([]);
            await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/chat/chrono`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: contextData.username, roomName: stanza }),
            })
                .then(response => {
                    response.json().then(pack => {
                        pack.forEach((element: packMessage) => {
                            setMessages(messages => [...messages, element]);
                        });
                    })
                })
        }
        else
            setMessages([]);
    }

    async function SetRoomName(client: string, target: string) {

        const API_TARGET = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/checkTarget/${target}`
        const checkTarget = await fetch(API_TARGET, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        })
            .then((response) => response.json());
        if (checkTarget) {
            if (client < target) {
                setStanza(client + target);
                return (client + target);
            }
            else {
                setStanza(target + client);
                return (target + client);
            }
        }
        else {
            setStanza(target);
            return (target);
        }
    }

    useEffect(() => {
        getChatMessages();
    }, [stanza])

    useEffect(() => {
        socket?.on('newUser', (usr_name: string) => {
            //console.log(usr_name + " connected.");
        });
        socket?.on('lostUser', (usr_name: string) => {
            //console.log(usr_name + " disconconnected.");
        });
        socket?.on('joinedRoom', (usr_room: string) => {
            //console.log(usr_room + " entered.");
        });
        socket?.on('leftRoom', (usr_name: string) => {
            //console.log(usr_name + " exited.");
        });
        socket?.on('msgToClient', (client_message: packMessage) => {
            //console.log("received from server: ", client_message);
            //console.log("msgtoclient:", client_message.room);
            //console.log(client_message);
            setMessages(messages => [...messages, client_message]);
        });
        socket?.on('disconnect', () => {
            socket?.emit('deleteUser', { usr: contextData.username }, (data: string) => console.log("deleteuser: ", data));
        })
    }, [socket]);

    function apri() {
        status === "chiusa" && setStatus("aperta")
    }

    function close() {
        //console.log("chiudo")
        status === "aperta" && setStatus("chiusa")
    }

    function search(e: React.ChangeEvent<HTMLInputElement>) {
        setSrc(e.target.value)
    }

    const handleSend = (e?: React.FormEvent<HTMLFormElement>) => {
        if (e)
            e.preventDefault();
        if (input !== '') {
            socket?.emit(
                'msgToServer',
                { room: stanza, username: contextData.username, message: input, avatar: contextData.avatar }
            );
            setInput('');
        }
    };

    const joinRoom = async (roomName: string) => {

        const room = await SetRoomName(contextData.username, roomName);
        //console.log("joooooooin === ", room)
        //console.log(stanza);
        socket?.emit('joinRoom', { client: contextData.username, room: room });
    }

    return (
        <>
            <div id="chat" className={status} onClick={apri}>
                <ChatHeader id="user"
                    main={true}
                    setGruppo={setGruppo}
                    stanza={stanza}
                    status={status}
                    close={close}
                    indietro={setStanza}
                />
                {!stanza && <input id="search" type="text" placeholder="Search a chatroom" value={src} onChange={search} />}
                <ChatBody arr={listUser}
                    main={true}
                    setGruppo={setGruppo}
                    user={contextData.username}
                    src={src}
                    stanza={stanza}
                    setStanza={joinRoom}
                    closed={status}
                    arrMessaggi={messages} />
                {stanza && <ChatInput closed={status} handleSend={handleSend} input={input} setInput={setInput} />}
            </div>
            {(gruppo && status !== "chiusa") && <ChatGroup status={status}
                setGruppo={setGruppo}
                main={false}
                client={contextData.username}
                arr={listUser}
                socket={socket}
            />}
        </>
    )
}

export default Chat2;