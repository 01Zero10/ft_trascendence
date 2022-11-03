import { Menu, Skeleton } from "@mantine/core";
import { IconMessage, IconUser } from "@tabler/icons";
import React from "react"


export default function ChannelMessage2(props:any)
{
	const createdAt = new Date("0000-12-24T23:59:59.249z")
	//TODO inserire God Options

	return(
		<Skeleton id={props.id} className={props.class}>
			<span id={props.id} className="dettagli">{createdAt.toString()}</span>
			<Menu position={"bottom-start"} closeDelay={400}>
				<Menu.Target>
					<span id={props.id} className="message-user">God</span>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item icon={<IconUser size={13}/>}>User profile</Menu.Item>
					<Menu.Item icon={<IconMessage size={13}/>}>Chat</Menu.Item>
				</Menu.Dropdown>
			</Menu>
			<span id={props.id} className="testo">Ritenta</span>
		</Skeleton>
		)
}