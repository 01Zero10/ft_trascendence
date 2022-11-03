import React, { useLayoutEffect, useState } from "react"
import { Rooms } from "../App";
import { Box, Button, PasswordInput, SegmentedControl, TextInput, TransferList, TransferListData } from "@mantine/core";


const initialValues: TransferListData = [
	[
		{ value: 'empty', label: 'empty' },
	],
	[
		{ value: 'empty2', label: 'empty2' },
	],
];

export default function OwnerPanel(props: any) {
	const [data, setData] = useState<TransferListData>(initialValues)
	const [password, setPassword] = useState("")
	const [confPassword, setConfPassword] = useState("")
	const [change, setChange] = useState(false)
	const [newOption, setNewOption] = useState({ ...props.chOptions });

	const [members, setMembers] = useState<{
		value: string;
		label: string;
	}[]>([]);
	const [admins, setAdmins] = useState<{
		value: string;
		label: string;
	}[]>([]);

	async function getRoomAdmins() {
		if (props.chOptions.name && props.chOptions.name != '') {
			const API_GET_ADMINS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/admins/${props.chOptions.name}`;
			if (props.chOptions?.name != '') {
				let response = await fetch(API_GET_ADMINS);
				let data = await response.json();
				let fetchAdmins: {
					value: string;
					label: string;
				}[] = [];
				await Promise.all(await data.map(async (element: any) => {
					let iMember: {
						value: string;
						label: string;
					} = {
						value: element.username,
						label: element.nickname,
					};
					fetchAdmins.push(iMember);
				}))
				setAdmins(fetchAdmins);
			}
		}
	}

	useLayoutEffect(() => setNewOption({...props?.chOptions}), [props?.chOptions])

	async function getChatMembers() {
		if (props.chOptions.name && props.chOptions.name != '') {
			const API_GET_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/members/${props.chOptions.name}`;
			if (props.chOptions?.name !== '') {
				let response = await fetch(API_GET_MEMBERS);
				let data = await response.json();
				let fetchMembers: {
					value: string;
					label: string;
				}[] = [];

				await Promise.all(await data.map(async (element: any) => {
					let iMember: {
						value: string;
						label: string;
					} = {
						value: element.username,
						label: element.nickname,
					};
					fetchMembers.push(iMember);
				}))
				setMembers(fetchMembers);
			}
		}
	}

	function checkChange(){

	}

	useLayoutEffect(() => {
		getChatMembers().then()
		getRoomAdmins().then()
	}, [props.chOptions])

	useLayoutEffect(() => {
		setData([admins, members])
	}, [admins, members])


	function changeType(value: string) {
		setNewOption((prevChOptions: Rooms) => {
			setChange(true)
			return ({
				...prevChOptions,
				type: value
			})
		})
	}

	function changeName(name: string) {
		setNewOption((prevChOptions: Rooms) => {
			setChange(true)
			return ({
				...prevChOptions,
				name: name
			})
		})
	}

	async function handleButtonClick() {
		const API_EDIT_CHAT = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/editChannel`;
		await fetch(API_EDIT_CHAT, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				channelName: props.chOptions.name,
				type: newOption.type,
				password: password,
				newName: newOption.name,
			})
		})
		const API_GET_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/editUsers`;
		await fetch(API_GET_MEMBERS, {
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			method: 'POST',
			body: JSON.stringify({ data: data, channelName: props.chOptions?.name })
		})
		setChange(false)
		props.setOwnerPanelOpen(false)
	}

	return (

		<div className={"owner-panel"}>
			{/* <LoadingOverlay visible={props.loader} overlayBlur={3} /> */}
			<Box>{props.chOptions.name} channel options</Box>
			<TextInput onChange={(e) => changeName(e.target.value)} placeholder={"New channel name"} />
			<SegmentedControl onChange={changeType} fullWidth
				color="grape"
				radius={"xl"}
				transitionDuration={350}
				defaultValue={newOption.type}
				value={newOption.type}
				data={[
					{ label: 'Public', value: 'public' },
					{ label: 'Protected', value: 'protected' },
					{ label: 'Private', value: 'private' },
				]}
			/>
			<div>Change Password</div>
			<PasswordInput
				label="New password"
				value={password}
				onChange={(e) => setPassword(e.currentTarget.value)}
				disabled={newOption.type !== "protected"}
			/>
			<PasswordInput
				label="Confirm password"
				value={confPassword}
				onChange={(e) => setConfPassword(e.currentTarget.value)}
				error={password === confPassword ? false : "password don't match"}
				disabled={newOption.type !== "protected"}
			/>
			<div>Add or remove Admin</div>
			<TransferList
				style={{ transition: "0" }}
				showTransferAll={false}
				value={data}
				nothingFound="No one here"
				searchPlaceholder="Search..."
				titles={['Admin', 'User']}
				breakpoint="sm"
				onChange={setData}
				radius={"md"}
			/>
			{<Button disabled={!change ||
				(newOption.type === "protected" &&
					(!confPassword || password !== confPassword) &&
					props.chOptions.type !== "protected")}
				type="button"
				radius="lg"
				size="sm"
				fullWidth
				color="grape"
				onClick={handleButtonClick} >Confirm</Button>}
		</div>
	)
}