import React, { useContext } from "react"
import MessageProps from "./propsType/MessageProps"
import { Avatar, Menu, Textarea } from "@mantine/core";
import {
	IconMessage,
	IconUser,
	IconDeviceGamepad2,
	IconBan,
	IconMessageOff
} from "@tabler/icons";
import { Student } from "../App";
import { useNavigate } from "react-router-dom";
import { Room } from "@mui/icons-material";
import './ChannelMessage_style.css';

//export default function ChannelMessage(props: MessageProps) {
export default function ChannelMessage(props: any) {
	const student = useContext(Student)
	let navigate = useNavigate();
	const naturalTime = (new Date(props.createdAt)).toString().slice(0, 24);

	async function privateChatWithUser(userToChatWith: string) {
		const API_URL_CREATE_DIRECT_CHAT = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/createDirectChat`;
		const ret = await fetch(API_URL_CREATE_DIRECT_CHAT, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({client: student.username, userToChatWith: userToChatWith}),
		}).then((response) => response.json())
		props.setCard(`FriendsChatList/${student.username}`);
		props.setRoom({ name: ret.name, type: 'direct', builder: {username: null} });
	}

	async function inviteUserToPlay(userToPlayWith: string){
		const API_URL_CREATE_DIRECT_GAME = `http://${process.env.REACT_APP_IP_ADDR}:3001/game/createDirectGame`;
		const API_URL_INVITE_TO_GAME = `http://${process.env.REACT_APP_IP_ADDR}:3001/navigation/inviteToGame`;
		const API_URL_UPDATE_BELL = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/bellUserToUpdate`;
		await fetch(API_URL_CREATE_DIRECT_GAME, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({client: student.username, userToPlayWith: userToPlayWith, type: 'classic'}),
		})
		await fetch(API_URL_INVITE_TO_GAME, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({client: student.username, userToPlayWith: userToPlayWith}),
		})
		await fetch( API_URL_UPDATE_BELL, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({bellUserToUpdate: userToPlayWith}),
		})
		navigate('/game');
	}

//  <Menu position={"bottom-start"} closeDelay={400}>
// 				<Menu.Target>
// 					<span id={props.id} className="message-user">{props.username}</span>
// 				</Menu.Target>
// 				{student.username !== props.username &&
// 					<Menu.Dropdown>
// 						<Menu.Item icon={<IconUser size={13} />} onClick={() => navigate(('/users/' + props.username))}>User profile</Menu.Item>
// 						<Menu.Item icon={<IconMessage size={13} />}>Chat</Menu.Item>
// 						<Menu.Item icon={<IconDeviceGamepad2 size={13} />}>Pong</Menu.Item>
// 							TODO: inserire controllo admin
// 						{(props.admin !== 0 && props.builder !== props.username) &&
// 							<>
// 								<Menu.Divider className={"divider"}></Menu.Divider>
// 								<Menu.Label>Admin options</Menu.Label>
// 								<Menu.Item icon={<IconBan size={13} />}>Ban</Menu.Item>
// 								<Menu.Item icon={<IconMessageOff size={13} />}>Mute</Menu.Item>
// 							</>}
// 					</Menu.Dropdown>}

// 			</Menu> 

	return (
		<>
			{ student.username !== props.username ? <div id={props.id} className={props.class} style={{margin: "0 0 1% 0.5%"}}>
					<div className="message_container">
						<Avatar
							className="avatarStyle"
							src={props.avatar}
							size={60}
							radius={0}
						/>
						<div className="text_header_container">
							<div className="usernameDetails_container">
								{/* <span id={props.id} className="usernameHeader">{props.username}</span> */}
								<Menu position={"bottom-start"} width="target" closeDelay={400}>
				<Menu.Target>
					<span id={props.id} className="usernameHeader">{props.nickname}</span>
				</Menu.Target>
				{student.username !== props.username &&
					<Menu.Dropdown>
						<Menu.Item className={"messageDropMenu_Item"} icon={<IconUser size={15} />} onClick={() => navigate(('/users/' + props.username))}>User profile</Menu.Item>
						<Menu.Item className={"messageDropMenu_Item"} icon={<IconMessage size={15} />} onClick={() => privateChatWithUser(props.username)}>Chat</Menu.Item>
						<Menu.Item className={"messageDropMenu_Item"} icon={<IconDeviceGamepad2 size={15} />} onClick={() => inviteUserToPlay(props.username)}>Pong</Menu.Item>
						{((props.admin && props.builder !== props.username && props.admins?.indexOf(props.username) === -1) || student.username === props.builder ) &&
							<>
								<Menu.Divider className={"messageDropMenu_divider"}></Menu.Divider>
								<Menu.Label>Admin options</Menu.Label>
								<Menu.Item className={"messageDropMenu_Item"} icon={<IconBan size={15} />} onClick={() => {props.setAction("ban"); props.setData((prevState: string[]) => [...prevState, props.username]); props.setModalTypeOpen("admin")}}>Ban</Menu.Item>
								<Menu.Item className={"messageDropMenu_Item"} icon={<IconMessageOff size={15} />} onClick={() => {props.setAction("mute"); props.setData((prevState: string[]) => [...prevState, props.username]); props.setModalTypeOpen("admin")}}>Mute</Menu.Item>
							</>}
					</Menu.Dropdown>}

			</Menu> 
								<span id={props.id} className="detailsHeader">{naturalTime}</span>
							</div>
							<div className="messageText">
							{/* <span id={props.id} className="">{props.message}</span> */}
							<p className="textMessageArea">
								{props.message}
							</p>
							</div>
						</div>
					</div>
		</div > :
				<div id={props.id} className={props.class} style={{display:"flex", flexDirection:"row-reverse",margin: "0 0.5% 1% 0%"}}>
					<div className="message_container_sender">
						<Avatar
							className="avatarStyle_sender"
							src={props.avatar}
							size={60}
							radius={0}
						/>
						<div className="text_header_container">
							<div className="usernameDetails_container_sender">
								<span id={props.id} className="usernameHeader_sender">{props.nickname}</span>
								<span id={props.id} className="detailsHeader_sender">{naturalTime}</span>
							</div>
							<div className="messageText">
								{/* <span id={props.id} className="">{props.message}</span> */}
								<p className="textMessageArea_sender">
									{props.message}
								</p>
							</div>
						</div>
					</div>
				</div >}
		</>
	)
}