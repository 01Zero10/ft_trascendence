import React, { useEffect, useState, useContext, useLayoutEffect } from "react"
import { Rooms, Student } from "../App";
import { ActionIcon, Badge, Box } from "@mantine/core";
import { IconLock, IconLockOpen, IconSettings } from "@tabler/icons";
import "./ChannelList_style.css"

export default function ChannelList(props: any) {
	const [channelList, setChannelList] = useState<object[]>([])
	const student = useContext(Student)

	async function getChannels() {
		let response = await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/chat/get${props.card}`);
		let data = await response.json();
		let options_: Rooms[] = [];
		await Promise.all(await data.map(async (element: any) => {
			if (options_.findIndex(x => x.name === element.name) === -1)
				options_.push(element);
		}))
		setChannelList(options_);
	}

	useEffect(() => {
		getChannels();
	}, [props.card]);

	useEffect(() => {
		props.socket?.on('update', async (type: string) => {
			if (props.card === "all")
				await getChannels();
		});
	}, [props.socket])

	// function setChOpt(channel: Rooms) {
	// 	if (props.chOptions?.name === channel.name) {
	// 		props.setChOptions(null)
	// 		props.setOpened("")
	// 		return
	// 	}
	// 	props.setChOptions(channel)
	// 	props.setOpened("owner")
	// }
	
	// const lockIcon = (<IconLock ></IconLock>)
	// const lockIconOpen = (<IconLockOpen></IconLockOpen>)


	return (
		<div style={{display: "flex", flexDirection: "column"}}>
			{channelList.map(function (element: any, id: number) {
				// console.log(element)
				return (
					element.name?.includes(props.src) ? (
						<button className="btn" key={id + "channel-selection"} onClick={() => props.setRoom({...element})}>
							<div className="btn__content" key={id + "settings- chat-select"} >
								{element.name}
							</div>
							<span className="btn__label">
								{element.type === "public" && <Badge className="channnelBadgeStyle" radius="xs">Public</Badge>}
								{element.type === "protected" && <Badge className="channnelBadgeStyle" radius="xs">Protected</Badge>}
								{element.type === "private" && <Badge className="channnelBadgeStyle" radius="xs">Private</Badge>}
								{/* {element.type === "protected" && <Badge variant="gradient" gradient={{ from: 'orange', to: 'red' }} radius="xs" leftSection={lockIcon}>Protected</Badge>} */}
							</span>
						</button> )
					: null)
				}
			)}
		</div>
	)

	// return (
	// 	// <div style={{width:"100%", height:"100%", position:"relative", background:"lime", color:"red"}}>
	// 	<>
	// 		{channelList.map(function (element: any, id: number) {
	// 			console.log(element)
	// 			return (
	// 				// element.name?.includes(props.src) ?
	// 					<div style={{width:"80%", height:"70px", position:"relative", marginBottom:"5px" }} key={id + "channel-selection"}>
	// 						<div key={id + "settings- chat-select"} >
	// 							<Box key={id + "box"} sx={{ position: "relative", width: "100%", height: "100%" }}>
	// 								{element.name}
	// 							</Box>
	// 							{element.type === "protected" && <Badge variant="gradient" gradient={{ from: 'orange', to: 'red' }} radius="xs" leftSection={lockIcon}>Protected</Badge>}
	// 						</div>
	// 					</div> )
	// 					// : null)
	// 			}
	// 		)}
	// 	</>
	// )
}