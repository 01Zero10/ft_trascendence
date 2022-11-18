import { Box, Button, Center, Modal, MultiSelect } from "@mantine/core"
import React, { useContext, useEffect, useLayoutEffect, useState } from "react"
import { Rooms, Student } from "../App";

export default function ChannelBodyNav(props: any) {
	const student = useContext(Student);
	const [newMembers, setNewMembers] = useState<string[]>([]);
	const [addMembersOptions, setAddMembersOptions] = useState<string[]>([]);
	const [nameToDisplay, setNameToDisplay] = useState<string>('');

	const [opened, setOpened] = useState(false);
	/* ***  array di utenti da poter aggiungere *** */

	useEffect(() => {
		if (props.room.type !== 'direct')
			setNameToDisplay(props.room.name);
		else
			setNameToDisplay('chat with: ' + props.room.name.replaceAll(student.username, ''));
	}, [props.room])

	async function SetJoinFetch() {
		const API_SET_JOIN = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/setJoin`;
		await fetch(API_SET_JOIN, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ client: student.username, channelName: props.room?.name, joined: props.joined }),
		})
	  //console.log(props.joined)
		props.setJoined((prevJoined: boolean) => !prevJoined);
		props.socket?.emit('updateList', { type: props.room?.type });
	}

	// useLayoutEffect(() => {		
	// 		if (!props.joined && props.room.name){
	// 			props.setRoom({ name: "", type: "", builder: { username: "" } })
	// 		}
	// 	} , [props.joined]
	// )

	async function loadAddMembersOptions() {
		const API_LOAD_ADD_MEMBERS_OPTIONS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/addMembersOptions`;
		setAddMembersOptions([]);
		await fetch(API_LOAD_ADD_MEMBERS_OPTIONS, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ channelName: props.room?.name, client: student.username }),
		})
			.then((response) => response.json())
			.then(data => setAddMembersOptions(data));
		setOpened(true)
	}

	async function handleAddMembers() {
		const API_ADD_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/addMembers`;
		await fetch(API_ADD_MEMBERS, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ nameChannel: props.room?.name, newMembers: newMembers }),
		})
		setNewMembers([]);
		setOpened(false);
	}

	// console.log("room: ",props.room)
	return (
		<>
			<Box className="channel-body-nav h2" sx={{ position: "relative", textAlign: "center", display: "flex" }}>
				{(props.room && student.username === props.builder && props.room.type !== "direct") &&
					<div style={{ paddingTop: "5px", position: "relative", width: "20%" }}>
						<Modal
							opened={opened}
							onClose={() => { setOpened(false); setNewMembers([]) }}
							transition="fade"
							transitionDuration={400}
							transitionTimingFunction="ease"
							withCloseButton={false}
							centered>
							<MultiSelect
								// nothingFound={addMembersOptions === []}
								data={addMembersOptions}
								value={newMembers}
								onChange={setNewMembers}
								label="Choose who you want to add!"
								placeholder="Click me to see the list.."
								maxDropdownHeight={150}
							/>
							<Center style={{ width: 400, height: 50 }}>
								<Button
									radius="xl"
									size="sm"
									variant="gradient"
									style={{ position: "relative", marginTop: "2%" }}
									gradient={{ from: 'orange', to: 'grape', deg: 70 }}
									onClick={handleAddMembers}
									disabled={!(Boolean(newMembers.length))}
								>
									ADD SELECTED MEMBERS
								</Button>
							</Center>
						</Modal>
						<Button
							radius="xl"
							size="md"
							variant="gradient"
							style={{ position: "relative", marginTop: "2%" }}
							gradient={{ from: 'orange', to: 'grape', deg: 70 }}
							onClick={loadAddMembersOptions}
						>
							ADD MEMBERS
						</Button>
					</div>}
				{(props.room && student.username !== props.builder && props.admin !== 0) &&
					<div style={{ paddingTop: "5px", position: "relative", width: "20%" }}>
						<Button
							radius="xl"
							size="md"
							variant="gradient"
							style={{ position: "relative", marginTop: "2%" }}
							gradient={{ from: 'orange', to: 'grape', deg: 70 }}
							onClick={() => props.opened ? props.setOpened("") : props.setOpened("admin")}
						>
							Admin Panel
						</Button>
					</div>}
				{props.room && <h3 style={{ width: "60%" }}>{nameToDisplay}</h3>}
				{!props.room &&
					<Center style={{ width: 1300, height: 130 }}>
						<Button onClick={() => props.setCreateChan((prevCreateChan: boolean) => (!prevCreateChan))} variant="filled" color="violet" size="lg" radius="xl" uppercase>
							Create a Channel
						</Button>
					</Center>}
				{(props.room.name && !props.joined && props.room.type !== "protected" && props.room.type != 'direct') &&
					<div style={{ paddingTop: "5px", position: "relative", width: "20%" }}>
						<Button radius="xl" size="md" variant="gradient" style={{ marginTop: "2%" }} gradient={{ from: 'orange', to: 'grape', deg: 70 }}
							onClick={() => SetJoinFetch()}>
							JOIN
						</Button>
					</div>}
				{(props.room.name && props.joined && props.room.type != 'direct') &&
					<div style={{ paddingTop: "5px", position: "relative", width: "20%" }}>
						<Button radius="xl" size="md" variant="gradient" style={{ marginTop: "2%" }} gradient={{ from: 'orange', to: 'grape', deg: 70 }}
							onClick={() => { SetJoinFetch(); props.setRoom({ name: "", type: "", builder: { username: "" } }) }}>
							LEAVE
						</Button>
					</div>}
			</Box>
		</>
	)
}