import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import ChannelBodyNav from "./ChannelBodyNav"
import ChannelMessage from "./ChannelMessage"
import ChannelInput from "./ChannelInput"
import { packMessage } from "../About";
import { Student } from "../App";
import { Box, Button, Modal, PasswordInput, Skeleton } from "@mantine/core";
import ChannelMessage2 from "./message2";
import CreateChannel from "./CreateChannel";
import { IconLock } from "@tabler/icons";


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
	// const [joined, setJoined] = useState(false)
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
		  //console.log(props.joined)
			props.setJoined((prevJoined: boolean) => !prevJoined);
			props.socket?.emit('updateList', { type: props.room.type });
		}
	}

	useEffect(() => {
		const API_GET_MUTES_BANS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getMyMutesAndBans/${student.username}`;
		async function setTimeoutMutesAndBans() {
			let response = await fetch(API_GET_MUTES_BANS, {
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
			})
			const data = await response.json();
		  //console.log(data);
			const now = new Date();
			for (const element of data) {
				let timer: any = new Date(element.expireDate).getTime() - now.getTime();
			  //console.log('elemento === ', element)
			  //console.log(timer);
				if (timer < 0)
					props.socket?.emit('singleMuteOrBanRemove', { channelName: element.channelName, client: student.username, status: element.status });
				else { //controllare se funziona?
					setTimeout(() => {
						props.socket?.emit('singleMuteOrBanRemove', { channelName: element.channelName, client: student.username, status: element.status });
					}, timer)
				}
			}
		}
		setTimeoutMutesAndBans().then();
	}, [])

	useEffect(() => {
		async function fillStateOnChannel() {
			const API_MY_STATE = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getMyState`;
			let response = await fetch(API_MY_STATE, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ channelName: props.room.name, client: student.username })
			})
			const data = await response.json();
			if (data === null || data === undefined) {
				//console.log("ahahaha, ", response);
				setMyState(null);
				return;
			}
			setMyState({
				mode: data.status,
				reason: data.reason,
				expire: data.expireDate
			})

		}
		fillStateOnChannel().then()
	}, [props.room])

	//console.log("MyStateOnChannel", myState);

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
			props.setJoined(data);
		}
		if (props.room.type === 'direct')
			props.setJoined(true);
		else
			checkJoined().then();
	}, [props.room])

	var prevUser: string

	function printImg(username: string): boolean {
		if (!prevUser) {
			prevUser = username;
			return true;
		} else {
			if (prevUser !== username) {
				prevUser = username;
				return true;
			}
			return false
		}
	}

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

	useEffect(() => console.log("controllo del proprio stato e"))

	useEffect(() => {
		getChatMessages();
	}, [props.room.name])

	useEffect(() => {
		props.socket?.on('msgToClient', (client_message: packMessage) => {
			setMessages(messages => [...messages, client_message]);
		});
	}, [props.socket])

	useEffect(() => {
		bottomRef.current?.scrollIntoView()
	}, [messages])

	useLayoutEffect(
		() => { setCheckPwd(props.room.type === "protected") },
		[props.room]
	)

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

	//console.log((!props.createChan && props.room && !joined && checkPwd))
	return (
		<div className="channel-body">
			{/*TODO: cambiare i nomi delle classi*/}
			<ChannelBodyNav
				admin={props.admin}
				builder={props.room.builder.username}
				room={props.room}
				joined={props.joined}
				setOpened={props.setOpened}
				opened={props.opened}
				setJoined={props.setJoined}
				//setCreateChan={props.setCreateChan}
				checkPwd={checkPwd}
				socket={props.socket}
				setRoom={props.setRoom}
			/>
			<div className="body-message">
				{<Box className="message-container">
					{/* {props.createChan && <CreateChannel setCreateChan={props.setCreateChan} socket={props.socket} />} */}
					{(!props.createChan && props.room && !props.joined && checkPwd) &&
						<Modal opened={checkPwd}
							onClose={() => setCheckPwd(false)}
							title="Insert the channel password" closeOnClickOutside>
							<PasswordInput
								placeholder="Password"
								error={inputPwd ? false : "Try again.."}
								radius="md"
								icon={<IconLock size={16} />}
								onChange={(e) => setInputPwd(e.currentTarget.value)}
							/>
							<Button
								size="md"
								radius="lg"
								fullWidth variant="gradient"
								gradient={{ from: 'orange', to: 'lime' }}
								disabled={inputPwd === ""}
								onClick={checkProtectedPassword}
							>
								Conferma
							</Button>
						</Modal>}
					{/*TODO: trovare modo di non fa eliminare il blur*/}
					{/* {!joined && <Overlay opacity={0.6} blur={3}></Overlay>} */}
					{!props.createChan ? myState?.mode !== "ban" ?
						messages.map((m: packMessage, id: number) => {
							return (
								<div key={id + "div"} className="single-message-container">
									{(props.joined && printImg(m.username)) &&
										<img
											key={id + "img"}
											className={student.username !== m.username ? "channel-photo-right" : "channel-photo-left"}
											src={m.avatar}
										/>}
									{props.joined ?
										<ChannelMessage
											key={id + "message"}
											class={m.username !== student.username ? "message assistent" : "message user"}
											builder={props.room.builder.username}
											message={m.message}
											createdAt={m.createdAt}
											username={m.username}
											admin={props.admin}
										/> :
										<>
											<Skeleton key={id + "skeleton"} className={student.username !== m.username ? "channel-photo-right" : "channel-photo-left"}></Skeleton>
											<ChannelMessage2 key={id + "godMessage"} class={m.username !== student.username ? "message assistent" : "message user"} />
										</>
									}
								</div>
							)
						}) :
						<ChannelMessage
							class={"message assistent"}
							//builder={props.room.builder.username}
							message={"sei stato bannato"}
							//TODO: vedere la data
							createdAt={() => { return new Date().toLocaleDateString() }}
							username={"System"}
						//admin={props.admin}
						/> : <CreateChannel setCreateChan={props.setCreateChan} socket={props.socket} />
					}
					{/* <div ref={bottomRef}></div> */}
				</Box>}
			</div>
			{(props.room && props.joined && myState?.mode !== "ban" && !props.createChan) && <ChannelInput
				handleSend={props.handleSend}
				setInput={props.setInput}
				input={props.input}
				mute={(myState?.mode === "mute")}
			/>}
		</div>
	)
}