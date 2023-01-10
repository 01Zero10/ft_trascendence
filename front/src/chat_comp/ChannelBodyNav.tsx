import { Box, Button, Center, Modal, MultiSelect, ActionIcon } from "@mantine/core"
import {
	IconAxe,
	IconDoorEnter,
	IconDoorExit,
	IconGavel,
	IconHammer,
	IconSettings,
	IconSettings2,
	IconUserPlus,
	IconWreckingBall
} from "@tabler/icons";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react"
import { Rooms, Student } from "../App";
import "./ChannelBody_style.css"
import CreateChannel from "./CreateChannel";

export default function ChannelBodyNav(props: any) {
	const student = useContext(Student);
	const [newMembers, setNewMembers] = useState<string[]>([]);
	const [addMembersOptions, setAddMembersOptions] = useState<string[]>([]);
	const [nameToDisplay, setNameToDisplay] = useState<string>('');
	/* ***  array di utenti da poter aggiungere *** */

	// useEffect(() => {
	// 	if (props.room.type !== 'direct')
	// 		setNameToDisplay(props.room.name);
	// 	else
	// 		setNameToDisplay('chat with: ' + props.room.name.replaceAll(student.username, ''));
	// }, [props.room])

	async function SetJoinFetch() {
		const API_SET_JOIN = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/setJoin`;
		await fetch(API_SET_JOIN, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ client: student.username, channelName: props.room?.name, joined: props.joined }),
		})
		props.setJoined((prevJoined: boolean) => !prevJoined);
		props.socket?.emit('updateList', { type: props.room?.type });
	}


	// async function loadAddMembersOptions() {
	// 	const API_LOAD_ADD_MEMBERS_OPTIONS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/addMembersOptions`;
	// 	setAddMembersOptions([]);
	// 	await fetch(API_LOAD_ADD_MEMBERS_OPTIONS, {
	// 		method: 'POST',
	// 		credentials: 'include',
	// 		headers: { 'Content-Type': 'application/json' },
	// 		body: JSON.stringify({ channelName: props.room?.name, client: student.username }),
	// 	})
	// 		.then((response) => response.json())
	// 		.then(data => setAddMembersOptions(data));
	// 	setOpened(true)
	// }

	// async function handleAddMembers() {
	// 	const API_ADD_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/addMembers`;
	// 	await fetch(API_ADD_MEMBERS, {
	// 		method: 'POST',
	// 		credentials: 'include',
	// 		headers: { 'Content-Type': 'application/json' },
	// 		body: JSON.stringify({ nameChannel: props.room?.name, newMembers: newMembers }),
	// 	})
	// 	setNewMembers([]);
	// 	setOpened(false);
	// }


	return (
		<div className="channelNavContainer">
			<CreateChannel modalTypeOpen={props.modalTypeOpen} room={props.room}/>
			<div className="channelNavTopBar">
				<div className="nonServoANiente"></div>
				<div className="channelTitleContainer">
					<div className="channelTitleBox">
						<div className="channelTitleContent">
							{/*{props.room.name}*/}
							{props.room.type === 'direct' ? props.room.name.replace(student.username, '') : props.room.name}
						</div>
					</div>
				</div>
				{props.room.type === 'direct' ? <div className="channelOptionBar"></div> :
				<div className="channelOptionBar">
					{/*TODO: inserire descrizione pulsanti*/}
					{(props.room.name && props.room.builder.username === student.username)&& <div className={"divIconContainer"}><IconSettings size={20} onClick={() => props.setModalTypeOpen("options")}></IconSettings><p className={"parIconDescription"}>OPTIONS</p></div>}
					{(props.room.name && props.room.builder.username === student.username)&& <div className={"divIconContainer"}><IconUserPlus size={20} onClick={() => props.setModalTypeOpen("add")}></IconUserPlus><p className={"parIconDescription"}>ADD USERS</p></div>}
					{(props.room.name && props.admin) && <div className={"divIconContainer"}><IconGavel size={20} onClick={() => props.setModalTypeOpen("admin")}></IconGavel><p className={"parIconDescription"}>ADMIN</p></div>}
					{(props.room.name && props.joined) && <div className={"divIconContainer"}><IconDoorExit size={20} onClick={() =>{ SetJoinFetch().then(); props.setRoom((prevState:any) => {return {...prevState, name:""}})}}></IconDoorExit><p className={"parIconDescription"}>LEAVE</p></div>}
					{(props.room.name && !props.joined && props.room.type !== "protected") && <div className={"divIconContainer"}><IconDoorEnter size={20} onClick={SetJoinFetch}></IconDoorEnter><p className={"parIconDescription"}>JOIN</p></div>}
				</div>
				}
			</div>
			{/* <svg style={{ position:"relative", height:"30%", width:"100%", rotate:"180deg", float:"right"}} ><image style={{ width:"20%"}} xlinkHref="/chat_decoration_top_mod_color2.svg"></image></svg> */}
		</div>
	)

	{/* <Center style={{ color:"#781C9C", position:"relative", height:"100%", width:"40%", background:"black"}} >{props.room.name}</Center> */}
}


