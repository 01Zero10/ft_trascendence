import React, { useContext, useState } from "react"
import Textbox from "../components/Textbox"
import ChannelList from "./ChannelList"
import { Button, Center, Tabs } from "@mantine/core";
import { Student } from "../App";
import { IconArrowBack, IconMessageCircle, IconPlus, IconShield, IconUser, IconUsers } from "@tabler/icons";


export default function ChatMenu(props: any) {
	const contextData = useContext(Student);
	let [src, setSrc] = useState('')
	let [card, setCard] = useState("public")

	function search(e: React.ChangeEvent<HTMLInputElement>) {
		setSrc(e.target.value)
	}

	return (
		<div className="chat-nav">
			<div className="chat-search">
				<p id="benvenuto" >Hi {props.student.username}</p>
				<p>SEARCH CHANNEL</p>
				<div>
					<form className="search-bar-form">
						<Textbox class="search-bar"
							autoComplete="off"
							handleChange={search}
							type="search"
							placeholder="Search"
						/>
					</form>
					<div style={{ display: "flex", width: "100%", height: "10%", marginTop: "7px", justifyContent: "center", alignItems: "center" }}>
						<div style={{display: "flex", }}>
							{/* <div style={{ width: "17%" }}></div> */}
							<div style={{ backgroundColor: "white", borderRadius: "5px 5px 0 0" }}>
								<Tabs variant="default" color="white" defaultValue="my_channel">
									<Tabs.List position="center">
										{/* <Tabs.Tab value={`membership/${contextData.id}`} color="grape" onClick={() => setCard(`membership/${contextData.id}`)}>My Channels</Tabs.Tab>
										<Tabs.Tab value="public" color="grape" onClick={() => setCard("public")}>Public</Tabs.Tab>
										<Tabs.Tab value="protected" color="grape" onClick={() => setCard("protected")}>Protected</Tabs.Tab>
										<Tabs.Tab value="uod" color="grape" onClick={() => setCard("uod")}>DM's</Tabs.Tab> */}
										<Tabs.Tab value={`membership/${contextData.id}`} icon={<IconUser size={14} />} color="grape" onClick={() => setCard(`membership/${contextData.id}`)}>My Channels</Tabs.Tab>
										<Tabs.Tab value="public" color="grape" icon={<IconUsers size={14} />} onClick={() => setCard("public")}>Public</Tabs.Tab>
										<Tabs.Tab value="protected" color="grape" icon={<IconShield size={14} />} onClick={() => setCard("protected")}>Protected</Tabs.Tab>
										<Tabs.Tab value={`FriendsChatList/${contextData.username}`} color="grape" icon={<IconMessageCircle size={14} />} onClick={() => setCard(`FriendsChatList/${contextData.username}`)}>DM's</Tabs.Tab>
									</Tabs.List>
								</Tabs>
							</div>
							{/* <div style={{ width: "17%" }}></div> */}
						</div>
					</div>
				</div>
			</div>
			<ChannelList
				setOpened={props.setOpened}
				src={src}
				card={card}
				room={props.room}
				chOptions={props.chOptions}
				socket={props?.socket}
				setRoom={props.setRoom}
				setChOptions={props.setChOptions}
			/>
			<div className="button-holder">
				<Center>
					<Button onClick={() => props.setCreateChan((prevCreateChan: boolean) => (!prevCreateChan))} 
						leftIcon={props.createChan ? <IconArrowBack />:<IconPlus />}variant="gradient" gradient={{ from: 'indigo', to: 'grape', deg: 35 }} size="lg" uppercase>
						{props.createChan ? "Back" : "Create a Channel"}
					</Button>
				</Center>
			</div>
		</div >
	)
}