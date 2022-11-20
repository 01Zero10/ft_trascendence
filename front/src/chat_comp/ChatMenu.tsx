import React, { useContext, useState } from "react"
import { Student } from "../App";
import {Tab} from "@mantine/core/lib/Tabs/Tab/Tab";
import {Tabs, Center} from "@mantine/core";
import {IconMessageCircle, IconPlus, IconShield, IconUser, IconUsers} from "@tabler/icons";
import {Fab} from "@mui/material";
import {positions} from "@mui/system";




export default function ChatMenu(props: any) {
	const contextData = useContext(Student);
	let [src, setSrc] = useState('')
	let [card, setCard] = useState("public")

	const tabStyle = {
		color:"violet",
	}

	function search(e: React.ChangeEvent<HTMLInputElement>) {
		setSrc(e.target.value)
	}

	return (
		<div className="chat-nav" style={{borderStyle:"solid", padding:"0 0 0 5px", backgroundColor:"black", }}>
			<Center style={{ textAlign:"center", position: "relative", height: "5%", backgroundColor: "black", width: "100%" }}>
				<img style={{width:"80%"}} src="/account_decoration_top.svg" alt="img_account" />
				<div style={{color:"#781C9C"}}> Trascendence Channel</div>
			</Center>
			<div style={{ position: "relative", height: "85%", backgroundColor: "black", width: "100%" }}>
				<Tabs variant={"default"} radius="lg" color={"grape"} defaultValue={"all"} style={{position:"relative", height:"90%"}}>
						<Tabs.List position="center" grow={true}>
							<Tabs.Tab color={"grape"} style={tabStyle} value="all"  icon={<IconUsers size={14} />} onClick={() => setCard("public")}>All Channel</Tabs.Tab>
							<Tabs.Tab color={"red"} style={{color:"red"}} value={`membership/${contextData.id}`} icon={<IconUser size={14} />} onClick={() => setCard(`membership/${contextData.id}`)}>My Channels</Tabs.Tab>
							{/*<Tabs.Tab value="protected" icon={<IconShield size={14} />} onClick={() => setCard("protected")}>Protected</Tabs.Tab>*/}
							<Tabs.Tab color={"orange"} style={{color:"orange"}} value={`FriendsChatList/${contextData.username}`} icon={<IconMessageCircle size={14} />} onClick={() => setCard(`FriendsChatList/${contextData.username}`)}>DM's</Tabs.Tab>
						</Tabs.List>
					<Tabs.Panel style={tabStyle} value="all">cazzo 1</Tabs.Panel>
					<Tabs.Panel style={tabStyle} value={`membership/${contextData.id}`}>cazzo 2</Tabs.Panel>
					<Tabs.Panel style={tabStyle} value={`FriendsChatList/${contextData.username}`}>cazzo 3</Tabs.Panel>

				</Tabs>
			</div>
			<div style={{height:"10%", backgroundColor:"black", display:"flex", borderRadius:"15px"}}>
				<div style={{position:"relative", width:"80%", height:"100%"}}>
					<img src="/account_decoration_down.svg" alt="img_account" />
				</div>
				<Fab style={{marginLeft:"10px"}} color="secondary" aria-label="add"><IconPlus></IconPlus></Fab>
			</div>
		</div >
	)
}