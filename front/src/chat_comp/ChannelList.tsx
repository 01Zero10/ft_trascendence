import React, { useEffect, useState, useContext, useLayoutEffect } from "react"
import { Rooms, Student } from "../App";
import { ActionIcon, Box } from "@mantine/core";
import { IconSettings } from "@tabler/icons";

export default function ChannelList(props: any) {
	const [channelList, setChannelList] = useState<object[]>([])

	const student = useContext(Student)

	//console.log(channelList);
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
		props.socket?.on('update', async (card: string) => {
			//console.log("porco");
			//if (props.card === card)
			await getChannels();
		});
	}, [props?.socket])

	function setChOpt(channel: Rooms) {
		if (props.chOptions?.name === channel.name) {
			props.setChOptions(null)
			props.setOpened("")
			return
		}
		props.setChOptions(channel)
		props.setOpened("owner")
	}
	
	return (
		<div className="chat-selection">
			{channelList.map(function (element: any, id: number) {
				return (
					element.name?.includes(props.src) ?
						<div key={id + "channel-selection"} className="channel-selection">
							<div key={id + "settings- chat-select"} className="settings- chat-select" >
								<Box key={id + "box"} sx={{ position: "relative", width: "100%", height: "100%" }} onClick={() => { props.setRoom(element.name) }}>
									{element.name}
								</Box>
								{(element.type !== "direct" && element.builder?.username === student.username) &&
									<ActionIcon key={id + "actionIcon"} style={{ verticalAlign: "center" }}
										onClick={() => setChOpt(element)}><IconSettings key={id + "settingsIcon"} /></ActionIcon>}
							</div>
						</div> :
						null)
			})}
		</div>
	)
}