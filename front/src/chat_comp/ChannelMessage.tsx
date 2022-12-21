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

	function privateChatWithUser(userToChatWith: string) {
		props.setCard(`FriendsChatList/${student.username}`);
		//setChatWithUser
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
					<span id={props.id} className="usernameHeader">{props.username}</span>
				</Menu.Target>
				{student.username !== props.username &&
					<Menu.Dropdown>
						<Menu.Item className={"messageDropMenu_Item"} icon={<IconUser size={15} />} onClick={() => navigate(('/users/' + props.username))}>User profile</Menu.Item>
						<Menu.Item className={"messageDropMenu_Item"} icon={<IconMessage size={15} />} onClick={() => privateChatWithUser(props.username)}>Chat</Menu.Item>
						<Menu.Item className={"messageDropMenu_Item"} icon={<IconDeviceGamepad2 size={15} />}>Pong</Menu.Item>
						{((props.admin && props.builder !== props.username && props.admins?.indexOf(props.username) === -1) || student.username === props.builder ) &&
							<>
								<Menu.Divider className={"messageDropMenu_divider"}></Menu.Divider>
								<Menu.Label>Admin options</Menu.Label>
								<Menu.Item className={"messageDropMenu_Item"} icon={<IconBan size={15} />}>Ban</Menu.Item>
								<Menu.Item className={"messageDropMenu_Item"} icon={<IconMessageOff size={15} />}>Mute</Menu.Item>
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
				<div id={props.id} className={props.class} style={{display:"flex", flexDirection:"row-reverse",margin: "0 0 1% 0.5%"}}>
					<div className="message_container_sender">
						<Avatar
							className="avatarStyle_sender"
							src={props.avatar}
							size={60}
							radius={0}
						/>
						<div className="text_header_container">
							<div className="usernameDetails_container_sender">
								<span id={props.id} className="usernameHeader_sender">{props.username}</span>
								<span id={props.id} className="detailsHeader">{naturalTime}</span>
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