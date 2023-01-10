import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import ChannelBodyNav from "./ChannelBodyNav"
import ChannelMessage from "./ChannelMessage"
import ChannelInput from "./ChannelInput"
//import { packMessage } from "../About";
import { Student } from "../App";
import {Box, Button, Center, Modal, PasswordInput, ScrollArea, Skeleton} from "@mantine/core";
import ChannelOptionModal from "./ChannelOptionModal";
import AdminPanel from "./AdminPanel";
import PasswordCheck from "./PasswordCheck";

export interface MyStateOnChannel {
	mode: string,
	reason: string,
	expire: Date,
}

export interface MutesAndBans {
	channel: string,
	expire: Date,
}

export interface AdminData{
	banList: string[],
	muteList: string[],
	kickList: string[], 
	unbanList: string[], 
	unmuteList: string[]
}

export interface packMessage {
    id: number,
    room: string,
    message: string,
    createdAt: Date,
	userInfo: { username: string,
		nickname: string,
		avatar: string,
	}
}

export default function ChannelBody(props: any) {
	const iniAdminData: AdminData = {banList:[], muteList:[], kickList: [], unbanList: [], unmuteList: []}
	const [messages, setMessages] = useState<packMessage[]>([])
	const bottomRef = useRef<null | HTMLDivElement>(null);
	const [action, setAction] = useState<string>('ban');
	const [data, setData] = useState<string[]>([]);
	const student = useContext(Student);
	const [modalTypeOpen, setModalTypeOpen] = useState<null | "admin" | "options" | "add">(null)
	const [myState, setMyState] = useState<MyStateOnChannel | null>(null);

	const [adminData, setAdminData] = useState<AdminData>({...iniAdminData})

	useEffect(() => {
		const API_GET_MUTES_BANS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getMyMutesAndBans/${student.username}`;
		async function setTimeoutMutesAndBans() {
			let response = await fetch(API_GET_MUTES_BANS, {
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
			})
			const data = await response.json();
			const now = new Date();
			for (const element of data) {
				let timer: any = now.getTime() - new Date(element.expireDate).getTime();
				if (timer < 0)
					props.socket?.emit('singleMuteOrBanRemove', { channelName: element.channelName, client: student.username, status: element.status });
				else {
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

	useLayoutEffect(() => {
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

	async function getChatMessages() {
		if (props.room !== "") {
			setMessages([]);
			await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/chat/chrono`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user: student.username, roomName: props.room.name, type: props.room.type }),
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
		if (props.room.name && (props.room.type === "public" || props.room.type === 'direct'))
			props.socket?.emit('joinRoom', { client: student.username, room: props.room.name });
		else if (props.room.name && props.room.type === "protected" && props.joined)
			props.socket?.emit('joinRoom', { client: student.username, room: props.room.name });
	}

	useLayoutEffect(() =>
		{
			joinRoom(props.room.name).then()
		}, [props.room, props.joined]
	)

	useEffect(() => {
		getChatMessages().then();
	}, [props.room.name])

	useEffect(() => {
		props.socket?.on('msgToClient', (client_message: packMessage) => {
			setMessages(messages => [...messages, client_message]);
		});
	}, [props.socket])

	useEffect(() => {
		bottomRef.current?.scrollIntoView()
	}, [messages])

	async function getBanned() {
		let fetchBanned: string[] = [];
		const API_GET_BANNED = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getBannedUsers/${props.room.name}`;
		if (props.room.name !== '') {
			let response = await fetch(API_GET_BANNED);
			let data = await response.json();
			await Promise.all(await data?.map(async (element: any) => {
				fetchBanned.push(element);
			}))
		}
		return fetchBanned;
	}

	async function getMuted() {
		let fetchMuted: string[] = []
		const API_GET_MUTED = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getMutedUsers/${props.room.name}`;
		if (props.room.name != '') {
			let response = await fetch(API_GET_MUTED);
			let data = await response.json();
			await Promise.all(await data?.map(async (element: any) => {
				fetchMuted.push(element);
			}))
		}
		return fetchMuted;
	}

	async function getNotBanned() {
		let fetchBanned: string[] = [];
		const API_GET_BANNED = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getNotBannedUsers/${props.room.name}`;
		if (props.room.name !== '') {
			let response = await fetch(API_GET_BANNED);
			let data = await response.json();
			await Promise.all(await data?.map(async (element: any) => {
				fetchBanned.push(element);
			}))
		}
		return fetchBanned;
	}

	async function getNotMuted() {
		let fetchMuted: string[] = []
		const API_GET_MUTED = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getNotMutedUsers/${props.room.name}`;
		if (props.room.name != '') {
			let response = await fetch(API_GET_MUTED);
			let data = await response.json();
			await Promise.all(await data?.map(async (element: any) => {
				fetchMuted.push(element);
			}))
		}
		return fetchMuted;
	}

	async function getChannelMembers() {
		const API_GET_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/allmembersandstatus/${props.room.name}`;
		let fetchMember: string[] = [];
		if (props.room.name) {
			let response = await fetch(API_GET_MEMBERS);
			let data = await response.json();
			await Promise.all(await data?.map(async (element: any) => {
				let iMember: {nickname: string, status: boolean} = {nickname : element.nickname, status: element.status ? true : false}
				if(element.nickname !== props.room.builder.username)
					fetchMember.push(iMember.nickname);
			}))
		}
		return fetchMember
	}

	async function prepareInitialData() {
		setAdminData(
			{
				banList: [...await getNotBanned().then()],
				muteList: [...await getNotMuted().then()],
				kickList : [...await getChannelMembers().then()],
				unbanList: [...await getBanned().then()],
				unmuteList: [...await getMuted().then()]
			}
		)
	}

	useEffect(() => {
		setAdminData({...iniAdminData})
		if (props.room.name && props.admin)
			prepareInitialData();
	}, [props.admin, props.room])


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


	return (
		<div style={{ position:"relative", height:"100%", width:"80%"}}>
			{(props.room.name && modalTypeOpen === "admin") && <AdminPanel
				room={props.room}
				action={action}
				data={data}
				members={props.members}
				adminData={adminData}
				setMembers={props.setMembers}
				setModalTypeOpen={setModalTypeOpen}
				setAction={setAction}
				setData={setData}
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
				joined={props.joined} 
				socket={props.socket} 
				setRoom={props.setRoom}
				setJoined={props.setJoined} 
				setModalTypeOpen={setModalTypeOpen} 
				/>
			{(props.room.name && (props.joined || props.room.type === "public")) ?
				myState?.mode !== "ban" ? 
					<div style={{background: "black", color: "white", position: "relative", height: "92%", width: "100%"}}>
						<ScrollArea style={{height: "89%"}} styles={scrollAreaStyle} type="hover" scrollHideDelay={(100)}>
							{props.room.name && messages.map((m: packMessage, id: number) => {
								if (student.blockedUsers && student.blockedUsers.findIndex(x => x === m.userInfo.username) != -1) {
									<></>
								} else
									return (<ChannelMessage 
											admin={props.admin}
											data={data}
											key={id}
											admins={props.admins}
											builder={props.room.builder.username}
											username={m.userInfo.username}
											nickname={m.userInfo.nickname}
											message={m.message}
											createdAt={m.createdAt}
											avatar={m.userInfo.avatar}
											setCard={props.setCard}
											room={props.room}
											setRoom={props.setRoom}
											setData={setData}
											setAction={setAction}
											setModalTypeOpen={setModalTypeOpen}
										/>
									)
									})}
							<div ref={bottomRef}></div>
						</ScrollArea>
						{(props.room.name && props.joined) && <ChannelInput
							className="inputTextArea"
							room={props.room}
							mute={(myState?.mode === "mute")}
							socket={props.socket}
						></ChannelInput>}
					</div> : 
						<div style={{color:"white"}}>BANNED {myState.reason ? "because " + myState.reason : ""}</div>
				:
				props.room.type === "protected" && !props.joined ?
					<PasswordCheck room={props.room} setJoined={props.setJoined}/>
					:
					<></>
			}
		</div>
	)
}