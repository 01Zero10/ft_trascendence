import React, { useContext, useEffect, useState } from "react"
import { Student } from "../App";
import {Tab} from "@mantine/core/lib/Tabs/Tab/Tab";
import {Tabs, Center, ScrollArea, Input, Modal} from "@mantine/core";
import {IconMessageCircle, IconPlus, IconShield, IconUser, IconUsers, IconArrowBack} from "@tabler/icons";
import {Fab} from "@mui/material";
import {positions} from "@mui/system";
import ChannelList from "./ChannelList";
import { Padding } from "@mui/icons-material";
import SearchIcon from '@mui/icons-material/Search';
import "./ChatMenu_style.css"
import CreateChannel from "./CreateChannel";



export default function ChatMenu(props: any) {
	const contextData = useContext(Student);
	const [src, setSrc] = useState('')
	//const [card, setCard] = useState("all")
	const [newChannel, setNewChannel] = useState(false)

	// ***** useEffect per sostituire tasto crea canale con '+' quando la pagina viene ridimensionata *****

	// const [matches, setMatches] = useState(window.matchMedia("(min-width: 1000px)").matches)
	// useEffect(() => { window.matchMedia("(min-width: 1000px)").addEventListener('change', e => setMatches( e.matches )); }, []);

	const tabStyle = {
		color:"#781C9C",
		fontWeight:"700",
		fontFamily: "'Tomorrow', sans-serif",
	}

	const tabPanelStyle = {
		color:"red",
		height:"80%",
		positions:"relative",
		padding:"10px 0 0 0", 
	}

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


	function search(e: React.ChangeEvent<HTMLInputElement>) {
		setSrc(e.target.value)
	}

	return (
		<div className="chat-nav" style={{marginBottom:"20px", borderStyle:"solid", padding:"0 0 0 15px", backgroundColor:"black", }}>
			<CreateChannel newChannel={newChannel} setNewChannel={setNewChannel} socket={props.socket}></CreateChannel>
			{/* <div style={{ textAlign:"center", position: "relative", height: "5%", backgroundColor: "black", width: "100%" }}>
				<img style={{ marginTop:"-10px", float:"right", width:"100%"}} src="/chat_decoration_top_mod_color.svg" alt="img_account" />
			</div> */}
			<div style={{ position: "relative", height: "86%", backgroundColor: "black", width: "100%" }}>
				<Tabs keepMounted={false} variant={"default"} radius="lg" color={"grape"} defaultValue={"all"} value={props.card} style={{position:"relative", height:"90%"}}>
					<Tabs.List position="center" grow={true}>
						<Tabs.Tab style={tabStyle} value="all"  icon={<IconUsers size={14} />} onClick={() => props.setCard("all")}>All Channel</Tabs.Tab>
						<Tabs.Tab style={tabStyle} value={`membership/${contextData.id}`} icon={<IconUser size={14} />} onClick={() => {props.setCard(`membership/${contextData.id}`)}}>My Channels</Tabs.Tab>
						{/*<Tabs.Tab value="protected" icon={<IconShield size={14} />} onClick={() => setCard("protected")}>Protected</Tabs.Tab>*/}
						<Tabs.Tab style={tabStyle} value={`FriendsChatList/${contextData.username}`} icon={<IconMessageCircle size={14} />} onClick={() => props.setCard(`FriendsChatList/${contextData.username}`)}>DM's</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel style={tabPanelStyle} value="all"><ScrollArea style={{height: "100%"}} styles={scrollAreaStyle} type="hover" scrollHideDelay={(100)} ><ChannelList socket={props.socket} src={src} card={props.card} setRoom={props.setRoom}/></ScrollArea></Tabs.Panel>
					<Tabs.Panel style={tabPanelStyle} value={`membership/${contextData.id}`}><ScrollArea style={{height: "100%"}} styles={scrollAreaStyle} type="hover" scrollHideDelay={(100)} ><ChannelList socket={props.socket} src={src} card={props.card} setRoom={props.setRoom}/></ScrollArea></Tabs.Panel>
					<Tabs.Panel style={tabPanelStyle} value={`FriendsChatList/${contextData.username}`}><ScrollArea style={{height: "100%"}} styles={scrollAreaStyle} type="hover" scrollHideDelay={(100)} ><ChannelList socket={props.socket} src={src} card={props.card} setRoom={props.setRoom}/></ScrollArea></Tabs.Panel>
				</Tabs>
				<div className="search_container">
					<input className="search_input" placeholder="Search" type="text" onChange={search} autoComplete="off"/>
				</div>
			</div>
			<div style={{backgroundColor:"black", display:"flex", borderRadius:"15px", flexDirection:"column"}}>
				<div style={{position:"relative", width:"100%", height:"100%"}}>
					<img src="/account_decoration_down.svg" alt="img_account" />
				</div>

				{newChannel ? 
					<button className="createChannelButton" onClick={() => setNewChannel(false)} ><div className="createChannelButton_content"><IconArrowBack></IconArrowBack>Back</div></button> :
				 	<button className="createChannelButton" onClick={() => setNewChannel(true)} ><div className="createChannelButton_content"><IconPlus></IconPlus>Create Channel</div></button>}
				{/* {matches && (<Fab style={{margin:"0 auto 0", width:"50%", backgroundColor: "#781C9C", color: "white" }} variant={"extended"} aria-label="add" onClick={() => setNewChannel(true)} ><IconPlus></IconPlus>Create Channel</Fab>)}
				{!matches && (<Fab style={{margin:"5% auto 0", backgroundColor: "#781C9C", color: "white"}} size="medium" onClick={() => setNewChannel(true)}><IconPlus></IconPlus></Fab>)} */}
			</div>
		</div >
	)
}
