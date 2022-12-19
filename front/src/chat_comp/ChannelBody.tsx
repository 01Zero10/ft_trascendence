import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import ChannelBodyNav from "./ChannelBodyNav"
import ChannelMessage from "./ChannelMessage"
import ChannelInput from "./ChannelInput"
import { packMessage } from "../About";
import { Student } from "../App";
import { Box, Button, Modal, PasswordInput, ScrollArea, Skeleton } from "@mantine/core";
import ChannelOptionModal from "./ChannelOptionModal";
import AdminPanel from "./AdminPanel";


/*A ogni click sulla stanza viene aggiornato MyState
myState viene riempito con un oggetto myStateOnChannel se
l'utente e' bannato o mutato nella stanza
se non ha nessun tipo di limitazione viene impostata a null
come per il join, lo state é stato messo qui in modo che possa
essere passato come prop ai componenti figli channel input e 
channelmessage*/

export interface MyStateOnChannel {
	mode: string,
	reason: string,
	expire: Date,
}

export interface MutesAndBans {
	channel: string,
	expire: Date,
}

//mood-silence, ban, user-search || user


export default function ChannelBody(props: any) {
	const [messages, setMessages] = useState<packMessage[]>([])
	const bottomRef = useRef<null | HTMLDivElement>(null);
	//---------------------------------------------------------
	// const [listUser, setListUser] = useState<string[]>([]);
	const student = useContext(Student);
	const [joined, setJoined] = useState(false)
	const [modalTypeOpen, setModalTypeOpen] = useState<null | "admin" | "options" | "add">(null)
	const [checkPwd, setCheckPwd] = useState(false)
	const [inputPwd, setInputPwd] = useState("")
	const [myState, setMyState] = useState<MyStateOnChannel | null>(null);


	async function checkProtectedPassword() {
		const API_CHECK_PROTECTED_PASS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/checkProtectedPass`;
		let response = await fetch(API_CHECK_PROTECTED_PASS, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ input: inputPwd, channelName: props.room.name })
		})
		const data = await response.json()
		if (data) {
			const API_SET_JOIN = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/setJoin`;
			await fetch(API_SET_JOIN, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ client: student.username, channelName: props.room.name, joined: props.joined }),
			})
			setJoined((prevJoined: boolean) => !prevJoined);
			props.socket?.emit('updateList', { type: props.room.type });
		}
	}

	// useEffect(() => {
	// 	const API_GET_MUTES_BANS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getMyMutesAndBans/${student.username}`;
	// 	async function setTimeoutMutesAndBans() {
	// 		let response = await fetch(API_GET_MUTES_BANS, {
	// 			credentials: 'include',
	// 			headers: { 'Content-Type': 'application/json' },
	// 		})
	// 		const data = await response.json();
	// 	  //console.log(data);
	// 		const now = new Date();
	// 		for (const element of data) {
	// 			let timer: any = new Date(element.expireDate).getTime() - now.getTime();
	// 		  //console.log('elemento === ', element)
	// 		  //console.log(timer);
	// 			if (timer < 0)
	// 				props.socket?.emit('singleMuteOrBanRemove', { channelName: element.channelName, client: student.username, status: element.status });
	// 			else { //controllare se funziona?
	// 				setTimeout(() => {
	// 					props.socket?.emit('singleMuteOrBanRemove', { channelName: element.channelName, client: student.username, status: element.status });
	// 				}, timer)
	// 			}
	// 		}
	// 	}
	// 	setTimeoutMutesAndBans().then();
	// }, [])

	// useEffect(() => {
	// 	async function fillStateOnChannel() {
	// 		const API_MY_STATE = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getMyState`;
	// 		let response = await fetch(API_MY_STATE, {
	// 			method: 'POST',
	// 			credentials: 'include',
	// 			headers: { 'Content-Type': 'application/json' },
	// 			body: JSON.stringify({ channelName: props.room.name, client: student.username })
	// 		})
	// 		const data = await response.json();
	// 		if (data === null || data === undefined) {
	// 			//console.log("ahahaha, ", response);
	// 			setMyState(null);
	// 			return;
	// 		}
	// 		setMyState({
	// 			mode: data.status,
	// 			reason: data.reason,
	// 			expire: data.expireDate
	// 		})

	// 	}
	// 	fillStateOnChannel().then()
	// }, [props.room])

	// //console.log("MyStateOnChannel", myState)

	useEffect(() => {
		async function checkJoined() {
			const API_CHECK_JOINED = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/checkJoined`;
			let response = await fetch(API_CHECK_JOINED, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ client: student.id, channelName: props.room.name })
			})
			const data = await response.json();
			//console.log("DATA: ",data)
			setJoined(data);
		}
		if (props.room.type === 'direct')
			setJoined(true);
		else
			checkJoined().then();
	}, [props.room])

	async function getChatMessages() {
		if (props.room !== "") {
			setMessages([]);
			await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/chat/chrono`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user: student.username, roomName: props.room.name }),
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

	const joinRoom = async (roomName: string) => {
		//console.log(props.room, joined)
		if (props.room.name && props.room.type === "public")
			props.socket?.emit('joinRoom', { client: student.username, room: props.room.name });
		else if (props.room.name && props.room.type === "protected" && joined)
			props.socket?.emit('joinRoom', { client: student.username, room: props.room.name });
	}

	useEffect(() => 
		{
			joinRoom(props.room.name)
		}, [props.room, joined]
	)

	useEffect(() => {
		getChatMessages();
	}, [props.room.name])

	useEffect(() => {
		props.socket?.on('msgToClient', (client_message: packMessage) => {
			//console.log("sono passato da qui")
			setMessages(messages => [...messages, client_message]);
		});
	}, [props.socket])

	useEffect(() => {
		bottomRef.current?.scrollIntoView()
	}, [messages])

	// useLayoutEffect(
	// 	() => { setCheckPwd(props.room.type === "protected") },
	// 	[props.room]
	// )

	// function checkIfProtected(element: any){
	// 	//console.log("cazzo")
	// 	if (element.type === "protected")
	// 	{
	// 		props.setCheckPwd(true);
	// 	}
	// 	else
	// 		props.setRoom(element.name)
	// }

	//-----------------------------------------------------------

	const scrollAreaStyle = {
		scrollbar: {
            '&, &:hover': {
              background: "black",
            },

            '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
              backgroundColor: "#781C9C"
            }
		}
	}

	//console.log("rodaltype:",modalTypeOpen )

	return (
		<div style={{ position:"relative", height:"100%", width:"80%"}}>
			{(props.room.name && modalTypeOpen === "admin") && <AdminPanel
				room={props.room}
				members={props.members}
				setMembers={props.setMembers}
				setModalTypeOpen={setModalTypeOpen}
				opened={(modalTypeOpen !== null)}
				socket={props.socket}
			/>}
			{(props.room.name && modalTypeOpen !== "admin" ) && <ChannelOptionModal 
				room={props.room} 
				members={props.members}
				modalTypeOpen={modalTypeOpen} 
				admins={props.admins}
				opened={(modalTypeOpen !== null)}
				setAdmins={props.setAdmins}
				setModalTypeOpen={setModalTypeOpen} 
				/>}
			<ChannelBodyNav 
				room={props.room} 
				admin={props.admin}
				joined={joined} 
				socket={props.socket} 
				setRoom={props.setRoom}
				setJoined={setJoined} 
				setModalTypeOpen={setModalTypeOpen} 
				/>
			<div style={{ background:"black",color:"white", position:"relative", height:"92%", width:"100%"}}>
				<ScrollArea style={{height:"89%"}} styles={scrollAreaStyle} type="hover" scrollHideDelay={(100)}>
				{props.room.name && messages.map((m: packMessage, id: number) => {
						if (student.blockedUsers && student.blockedUsers.findIndex(x => x === m.username) != -1)
						{
							console.log(student.blockedUsers.findIndex(x => x === m.username));
						}	
						else
							return(
							<ChannelMessage admin={props.admin}
											key={id}
											admins={props.admins}
											builder={props.room.builder.username}
											username={m.username} message={m.message}
											createdAt={m.createdAt}
											avatar={m.avatar}/>
						)
				})}
				<div ref={bottomRef}></div>
				</ScrollArea>
				{(props.room.name && joined) && <ChannelInput
				className="inputTextArea"
				room={props.room}
				mute={(myState?.mode === "mute")}
				socket={props.socket}
				></ChannelInput>}
			</div>
		</div>
	)
}