import React, { useContext, useEffect, useLayoutEffect, useState, } from "react"
import "./Chat.css"
import ChannelBody from "./chat_comp/ChannelBody"
import ChatMenu from "./chat_comp/ChatMenu"
import { Rooms, Student } from "./App"
import { io, Socket } from "socket.io-client"
import ChannelBodyStatus from "./chat_comp/ChannelBodyStatus"
import Navigation from "./Navigation"

export default function Chat() {


	const student = useContext(Student);
	const [room, setRoom] = useState<Rooms>({ name: "", type: "", builder: { username: "", nickname: ""} })
	const [chOptions, setChOptions] = useState<Rooms | null>(null)
	const [card, setCard] = useState("all")
	const [joined, setJoined] = useState(false)

	const [socket, setSocket] = useState<Socket | null>(null);
	useLayoutEffect(() => {
	 	if (student.id !== 0) {
			const newSocket = io(`http://${process.env.REACT_APP_IP_ADDR}:3001/chat`, { query: { userID: String(student.id) } });
			newSocket.on('connect', () => {
		  		setSocket(newSocket);
		//   student.socket_id = newSocket.id;
			})
		return () => {
			newSocket.disconnect();
		}
	}
	}, [student.id]);


	// async function SetRoomName(client: string, target: string) {

	// 	const API_TARGET = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/checkTarget/${target}`
	// 	const checkTarget = await fetch(API_TARGET, {
	// 		credentials: 'include',
	// 		headers: { 'Content-Type': 'application/json' },
	// 	})
	// 		.then((response) => response.json());
	// 	if (checkTarget) {
	// 		if (client < target) {
	// 			setRoom((prevRoom) => { return ({ ...prevRoom, name: client + target, type: 'direct' }) });
	// 			return (client + target);
	// 		}
	// 		else {
	// 			setRoom((prevRoom) => { return ({ ...prevRoom, name: target + client, type: 'direct' }) });
	// 			return (target + client);
	// 		}
	// 	}
	// 	else {
	// 		const API_GET_CHANNEL = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getChannel/${target}`
	// 		const fetchRoom = await fetch(API_GET_CHANNEL, {
	// 			credentials: 'include',
	// 			headers: { 'Content-Type': 'application/json' },
	// 		})
	// 			.then((response) => response.json())
	// 		setRoom({ name: fetchRoom.name, type: fetchRoom.type, builder: { ...fetchRoom.builder } });
	// 		return target;
	// 	}
	// }

	// const joinRoom = async (roomName: string) => {
	// 	const room = await SetRoomName(student.username, roomName);
	// 	props.socket?.emit('joinRoom', { client: student.username, room: room });
	// }

	// const handleSend = (e?: React.FormEvent<HTMLFormElement>) => {
	// 	if (e)
	// 		e.preventDefault();
	// 	if (input !== '') {
	// 		props.socket?.emit(
	// 			'msgToServer',
	// 			{ room: room.name, username: student.username, message: input, avatar: student.avatar }
	// 		);
	// 		setInput('');
	// 	}
	// };

	return (
		<>
		<Navigation />
		<div className="chat-dashboard">
			<ChatMenu setRoom={setRoom} socket={socket} setCard={setCard} card={card}></ChatMenu>
			<ChannelBodyStatus room={room} socket={socket} setRoom={setRoom} setCard={setCard} joined={joined} setJoined={setJoined}></ChannelBodyStatus>
		</div>
		</>
	)
}
