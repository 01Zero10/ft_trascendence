import React, { useContext, useEffect, useState } from "react"
import { Student } from "../App";
import {Tab} from "@mantine/core/lib/Tabs/Tab/Tab";
import {Tabs, Center, ScrollArea, Input} from "@mantine/core";
import {IconMessageCircle, IconPlus, IconShield, IconUser, IconUsers} from "@tabler/icons";
import {Fab} from "@mui/material";
import {positions} from "@mui/system";
import ChannelList from "./ChannelList";
import { Padding } from "@mui/icons-material";
import Textbox from "../components/Textbox";
import SearchIcon from '@mui/icons-material/Search';
import "./ChatMenu_style.css"



export default function ChatMenu(props: any) {
	const contextData = useContext(Student);
	let [src, setSrc] = useState('')
	let [card, setCard] = useState("public")

	const [matches, setMatches] = useState(window.matchMedia("(min-width: 1000px)").matches)
	
	useEffect(() => { window.matchMedia("(min-width: 1000px)").addEventListener('change', e => setMatches( e.matches )); }, []);

	const tabStyle = {
		color:"#781C9C",
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
			<div style={{ textAlign:"center", position: "relative", height: "5%", backgroundColor: "black", width: "100%" }}>
				<img style={{ marginTop:"-10px", float:"right", width:"100%"}} src="/chat_decoration_top_mod_color.svg" alt="img_account" />
				{/* <div style={{color:"#781C9C", width:"30%"}}>Trascendence Channel</div> */}
			</div>
			<div style={{ position: "relative", height: "85%", backgroundColor: "black", width: "100%" }}>
				<Tabs keepMounted={false} variant={"default"} radius="lg" color={"grape"} defaultValue={"all"} style={{position:"relative", height:"90%"}}>
					<Tabs.List position="center" grow={true}>
						<Tabs.Tab color={"grape"} style={tabStyle} value="all"  icon={<IconUsers size={14} />} onClick={() => setCard("all")}>All Channel</Tabs.Tab>
						<Tabs.Tab color={"red"} style={{color:"red"}} value={`membership/${contextData.id}`} icon={<IconUser size={14} />} onClick={() => setCard(`membership/${contextData.id}`)}>My Channels</Tabs.Tab>
						{/*<Tabs.Tab value="protected" icon={<IconShield size={14} />} onClick={() => setCard("protected")}>Protected</Tabs.Tab>*/}
						<Tabs.Tab color={"orange"} style={{color:"orange"}} value={`FriendsChatList/${contextData.username}`} icon={<IconMessageCircle size={14} />} onClick={() => setCard(`FriendsChatList/${contextData.username}`)}>DM's</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel style={tabPanelStyle} value="all">cazzo 1</Tabs.Panel>
					<Tabs.Panel style={tabPanelStyle} value={`membership/${contextData.id}`}><ScrollArea style={{height: "100%"}} styles={scrollAreaStyle} type="hover" scrollHideDelay={(100)} ><ChannelList src={src} card={card}/></ScrollArea></Tabs.Panel>
					<Tabs.Panel style={tabPanelStyle} value={`FriendsChatList/${contextData.username}`}><ScrollArea style={{height: "100%"}} styles={scrollAreaStyle} type="hover" scrollHideDelay={(100)} ><ChannelList card={card}/></ScrollArea></Tabs.Panel>
				</Tabs>
				<div className="search_container">
					<input className="search_input" placeholder="Search" type="text" onChange={search} autoComplete="off"/>
				</div>
			</div>
			<div style={{backgroundColor:"black", display:"flex", borderRadius:"15px", flexDirection:"column"}}>
				<div style={{position:"relative", width:"100%", height:"100%"}}>
					<img src="/account_decoration_down.svg" alt="img_account" />
				</div>
				{matches && (<Fab style={{margin:"0 auto 0", width:"50%", backgroundColor: "#781C9C", color: "white" }} variant={"extended"} aria-label="add"><IconPlus></IconPlus>Create Channel</Fab>)}
				{!matches && (<Fab style={{margin:"5% auto 0", backgroundColor: "#781C9C", color: "white"}} size="medium"><IconPlus></IconPlus></Fab>)}
			</div>
		</div >
	)
}
