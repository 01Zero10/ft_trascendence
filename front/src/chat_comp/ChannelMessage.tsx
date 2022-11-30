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

export default function ChannelMessage(props: MessageProps) {
	const student = useContext(Student)
	let navigate = useNavigate();
	const naturalTime = (new Date(props.createdAt)).toString().slice(0, 24);

{/* <Menu position={"bottom-start"} closeDelay={400}>
				<Menu.Target>
					<span id={props.id} className="message-user">{props.username}</span>
				</Menu.Target>
				{student.username !== props.username &&
					<Menu.Dropdown>
						<Menu.Item icon={<IconUser size={13} />} onClick={() => navigate(('/users/' + props.username))}>User profile</Menu.Item>
						<Menu.Item icon={<IconMessage size={13} />}>Chat</Menu.Item>
						<Menu.Item icon={<IconDeviceGamepad2 size={13} />}>Pong</Menu.Item>
							TODO: inserire controllo admin
						{(props.admin !== 0 && props.builder !== props.username) &&
							<>
								<Menu.Divider className={"divider"}></Menu.Divider>
								<Menu.Label>Admin options</Menu.Label>
								<Menu.Item icon={<IconBan size={13} />}>Ban</Menu.Item>
								<Menu.Item icon={<IconMessageOff size={13} />}>Mute</Menu.Item>
							</>}
					</Menu.Dropdown>}

			</Menu> */}

	return (
		<div id={props.id} className={props.class}>
			<div className="messageContainer">
				<div className="messageContent">
					<div className="messageHeader">
						<Avatar
							src={student.avatar}
							size="lg"

						/>
						<span id={props.id} className="">{props.username}</span>
						<span id={props.id} className="">{naturalTime}</span>
					</div>
					<div className="messageText">
						{/* <span id={props.id} className="">{props.message}</span> */}
						<Textarea>
							{props.message}
						</Textarea>
					</div>
				</div>
			</div>
		</div >
	)
}