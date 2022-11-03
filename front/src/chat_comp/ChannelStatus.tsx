import React, { useEffect, useState } from "react"
import { Box, Collapse, TransferListData, ActionIcon, Button, Center } from "@mantine/core";
import { IconArrowBigDown, IconArrowBigTop } from '@tabler/icons';
import OptionsPanel from "./OptionsPanel";

//non applicata bene... da capire meglio domani :D
// export interface Member {
// 	id: Number,
// 	username: string,
// 	nickname: string,
// 	avatar: string,
// }

const initialValues: TransferListData = [
	[
		{ value: 'empty', label: 'empty' },
	],
	[
		{ value: 'empty', label: 'empty' },
	],
];

export default function ChannelStatus(props: any) {

	const [ownerOpen, setOwnerOpen] = useState(true)
	const [adminOpen, setAdminOpen] = useState(true)
	const [userOpen, setUserOpen] = useState(true)

	useEffect(
		() => {
			if (!props.chOptions) {
				setOwnerOpen(true)
				setAdminOpen(true)
				setUserOpen(true)
			} else {
				setOwnerOpen(false)
				setAdminOpen(false)
				setUserOpen(false)
			}
		}, [props.chOptions])


	return (
		<div className="channel-user-list">
			<div id="user-list" className={props.opened ? "" : "open"}>
				<div id="user-list" style={{ height: "80%" }} className={""}>
					<Box sx={{ display: "block", width: "100%", height: "30px", backgroundColor: "#BE4BDB", textAlign: "center" }}>Channel Owner
					</Box>
					<ActionIcon onClick={() => setOwnerOpen((prevUserOpen) => !prevUserOpen)} variant="filled" color={"grape"} sx={{ marginTop: "-30px", float: "right", height: "30px" }}>
						{ownerOpen ? <IconArrowBigTop color={"#000000"} size={16} /> : <IconArrowBigDown color={"#000000"} size={16} />}
					</ActionIcon>
					<Collapse in={ownerOpen} transitionDuration={300}>
						{(props.room.name && props.joined) && <Box sx={{ textAlign: "center" }}>{props.room.builder.username}</Box>}
					</Collapse>
					<Box sx={{ display: "block", width: "100%", height: "30px", backgroundColor: "#BE4BDB", paddingBottom: "-10px", textAlign: "center" }}>
						Admin list
					</Box>
					<ActionIcon onClick={() => setAdminOpen((prevAdminOpen) => !prevAdminOpen)} variant="filled" color={"grape"} sx={{ marginTop: "-30px", float: "right", height: "30px" }}>
						{adminOpen ? <IconArrowBigTop color={"#000000"} size={16} /> :
							<IconArrowBigDown color={"#000000"} size={16} />}
					</ActionIcon>
					<Collapse in={adminOpen} transitionDuration={300}>
						{(props.room.name && props.joined) && props.admins.map((element: string) => <Box sx={{ textAlign: "center" }}>{element}</Box>)}
					</Collapse>
					<Box sx={{ display: "block", width: "100%", height: "30px", backgroundColor: "#BE4BDB", textAlign: "center" }}>User list
					</Box>
					<ActionIcon onClick={() => setUserOpen((prevUserOpen) => !prevUserOpen)} variant="filled" color={"grape"} sx={{ marginTop: "-30px", float: "right", height: "30px" }}>
						{userOpen ? <IconArrowBigTop color={"#000000"} size={16} /> : <IconArrowBigDown color={"#000000"} size={16} />}
					</ActionIcon>
					<Collapse in={userOpen} transitionDuration={300}>
						{(props.room.name && props.joined) && props.members.map((element: string) => <Box sx={{ textAlign: "center" }}>{element}</Box>)}
					</Collapse>
				</div>
				{/*{(props.room.name && !props.opened) &&*/}
				{/*	<Center>*/}
				{/*		<Button onClick={() => props.setCreateChan((prevCreateChan: boolean) => (!prevCreateChan))} variant="outline" color="lime" size="xl" uppercase>*/}
				{/*			Create a Channel*/}
				{/*		</Button>*/}
				{/*	</Center>*/}
				{/*	}*/}
				{props.opened && <OptionsPanel
					room={props.room}
					opened={props.opened}
					chOptions={props.chOptions}
					setOpened={props.setOpened}
					socket={props.socket}
				/>}
			</div>
		</div>
	)
}
