import {
	Box,
	Button, FocusTrap,
	Input,
	Modal, MultiSelect,
	NumberInput, PasswordInput,
	ScrollArea,
	SegmentedControl, Tabs,
	TextInput,
	TransferList,
	TransferListData
} from "@mantine/core";
import { IconAt, IconClock } from "@tabler/icons";
import React, { SetStateAction, useEffect, useLayoutEffect, useState } from "react"

export default function AdminPanel(props: any) {
	const tabStyle = {
		color:"#781C9C",
		fontWeight:"bold",
	}

	/*TODO: implementare bene con owner
	con il pulsante admin la stanza e' sbagliata*/

	//🔇🚫

	//console.log("srranzoa", props.room.name);
	//variabili
	const [action, setAction] = useState<string>('ban');
	const [data, setData] = useState<TransferListData>([[], []]);
	// const [members, setMembers] = useState<string[]>([])
	const [limitedUsers, setLimitedUsers] = useState<{
		value: string;
		label: string;
	}[]>([]);
	const [options, setOptions] = useState<{
		value: string;
		label: string;
	}[]>([]);

	const [time, setTime] = useState<number | undefined>(undefined);
	const [reason, setReason] = useState<string>('');


	// async function getChannelMembers() {
	// 	const API_GET_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/allmembers/${props.room.name}`;
	// 	if (props.room.name !== '') {
	// 		let response = await fetch(API_GET_MEMBERS);
	// 		let data = await response.json();
	// 		//console.log("data: ", data)
	// 		let fetchMember: string[] = [];
	// 		await Promise.all(await data?.map(async (element: any) => {
	// 			let iMember:string = element.nickname;
	// 			fetchMember.push(iMember);
	// 		}))
	// 		setMembers(fetchMember);
	// 	}
	// }



	useLayoutEffect(() => {
	  //console.log("metti il controllo sui bannati e mutati")
		props.socket.emit('expiredMuteOrBan', { channelName: props.room.name });
		//const API_EXPIRED_MUTE_OR_BAN = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/expiredMuteOrBan/ancora`;
	}, [props.opened])


  //console.log("room: ", props.room)
	//funzioni switch mute/ban

	// function switchAction(value: SetStateAction<"ban" | "mute" | "kick">) {
	// 	// if (action === 'ban')
	// 	// 	setAction('mute')
	// 	// else
	// 	// 	setAction('ban')
	// 	setAction(value);
	// }

	async function handleMuteBan() {
		const API_MUTE_BAN = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/handleMuteBan`;
		await fetch(API_MUTE_BAN, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				channelName: props.room.name,
				mode: action,
				limited: data,
				time: time,
				reason: reason,
			})
		})
		setTime(undefined);
		setReason('');
	}

	async function getMuted() {
		const API_GET_MUTED = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getMutedUsers/${props.room.name}`;
		if (props.room.name != '') {
			let response = await fetch(API_GET_MUTED);
			let data = await response.json();
		  //console.log("muuuuuuuuted banned = ", data);
			let fetchMuted: {
				value: string;
				label: string;
			}[] = [];
			await Promise.all(await data?.map(async (element: any) => {
				let iMember: {
					value: string;
					label: string;
				} = {
					value: element,
					label: element,
				};
				fetchMuted.push(iMember);
			}))
			setLimitedUsers(fetchMuted);
		}
	}

	async function getBanned() {
		const API_GET_BANNED = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getBannedUsers/${props.room.name}`;
		if (props.room.name !== '') {
			let response = await fetch(API_GET_BANNED);
			let data = await response.json();
			// console.log("daaaaaata banned = ", data);
			let fetchBanned: {
				value: string;
				label: string;
			}[] = [];
			await Promise.all(await data?.map(async (element: any) => {
				let iMember: {
					value: string;
					label: string;
				} = {
					value: element,
					label: element,
				};
				fetchBanned.push(iMember);
			}))
			setLimitedUsers(fetchBanned);
		}
	}

	async function getOptions() {
		const API_GET_MUTE_BAN_OPTIONS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getMuteBanOptions`;
		if (props.room.name != '') {
			let response = await fetch(API_GET_MUTE_BAN_OPTIONS, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ channelName: props.room.name, mode: action }),
			});
			let data = await response.json();
			// console.log("daaaaaata options = ", data);
			let fetchOptions: {
				value: string;
				label: string;
			}[] = [];
			await Promise.all(await data?.map(async (element: any) => {
				let iMember: {
					value: string;
					label: string;
				} = {
					value: element,
					label: element,
				};
				fetchOptions.push(iMember);
			}))
			setOptions(fetchOptions);
		}
	}

	//funzioni gestione tempo e motivazione

	//console.log('time = ', time);
	//console.log('reason = ', reason);

	function checkSettings() {
		//console.log(reason);
		if (action !== ('kick') && time === undefined)
			return false;
		else if (data[0].length === 0)
			return false;
		return true;
	}

	//useEffects

	useLayoutEffect(() => {
		async function prepareInitialData() {
			await getOptions();
			await getBanned()
		}
		prepareInitialData();
	}, [props.room.name])

	useLayoutEffect(() => {
		async function handleChangeMode() {
			setData([limitedUsers, options]);
		}
		handleChangeMode();
	}, [limitedUsers])

	useEffect(() => {
		async function prepareData() {
			if (action === 'ban') {
				//console.log('b-b-ban');
				await getOptions();
				await getBanned();
			}
			else if (action === 'mute') {
				//console.log('m-m-muted');
				await getOptions();
				await getMuted();
			}
			else {
				await getOptions();
				setLimitedUsers([]);
			}
		}
		prepareData();
	}, [action])

	//

	//console.log(members)
	return (<>
			<Modal centered withCloseButton={false} closeOnClickOutside={false} zIndex={1500}
				   styles={(root) => ({
					   inner:{
						   backgroundColor: 'transparent',
					   },
					   modal: {
						   backgroundColor: 'transparent',
						   display: "flex",
						   flexDirection:"column" ,
						   alignItems:"center",
						   justifyContent:"center",
						   margin: 0,
					   },
					   body:{
						   width:"100%",
						   height:"80%",
						   backgroundColor: 'transparent',
						   textAlign: 'center',
					   },
				   })}
				   opened={props.opened} onClose={ () => props.setModalTypeOpen(null) }>
				<div>
					<div style={{width:"100%"}}>
						{props.modalTypeOpen === "options" &&
							<SegmentedControl style={{width:"100%",height: "50px"}} value={""} data={[]} onChange={() => {}}
						 styles={() => ({
							 root: {
								 backgroundColor:"transparent",
							 },
							 control: {
								 margin:"auto 2% auto",
								 height: "100%",
								 border:"0",
								 outline: "none",
								 backgroundColor: "#781C9C",
								 cursor: "pointer",
								 position: "relative",
								 color: "#fafafa",
								 clipPath: "polygon(92% 0, 100% 25%, 100% 100%, 8% 100%, 0% 75%, 0 0)",
								 '&:not(:first-of-type)':{
									 border: "none",
								 }
							 },
							 active: {
								 backgroundColor:"transparent",
							 },
							 label: {
								 display: "flex",
								 alignItems: "center",
								 justifyContent: "center",
								 position: "absolute",
								 fontFamily: "'Tomorrow', sans-serif",
								 fontSize: "0.95rem",
								 top: "2px",
								 left: "2px",
								 right: "2px",
								 bottom: "2px",
								 backgroundColor: "#050a0e",
								 clipPath: "polygon(92% 0, 100% 25%, 100% 100%, 8% 100%, 0% 75%, 0 0)",
								 '&:hover':{
									 color:"#fafafa",
									 backgroundColor: "#050a0ec6",
								 }
							 },
							 labelActive:{
								 color: "#fafafa !important",
							 },
							 controlActive:{
								 backgroundColor: "#fafafa"
							 }
						 })}/>}
					</div>
					<img src="/account_decoration_top.svg" alt="" />
					{props.modalTypeOpen === "options" && <div className="search_container">
						<input  className="search_input"
								placeholder={props.room.name}
								type="text"
								autoComplete="off"
								value={""}
								// onChange={(e) => changeName(e.target.value)}
						/>
					</div>}
					<Tabs
						keepMounted={false}
						variant={"default"}
						radius="xs"
						color={"grape"}
						defaultValue={"ban"}
						style={{position:"relative", height:"90%"}}>
						<Tabs.List>
							<Tabs.Tab style={tabStyle} value={"ban"}>BAN</Tabs.Tab>
							<Tabs.Tab style={tabStyle} value={"mute"}>MUTE</Tabs.Tab>
							<Tabs.Tab style={tabStyle} value={"kick"}>KICK</Tabs.Tab>
						</Tabs.List>
						<Tabs.List>
							<Tabs.Tab style={tabStyle} value={"unban"}>UNBAN</Tabs.Tab>
							<Tabs.Tab style={tabStyle} value={"unmute"}>UNMUTE</Tabs.Tab>
						</Tabs.List>
						<img style={{rotate:"180deg"}}src="/account_decoration_down.svg" alt="" />
						<Tabs.Panel style={{color:"white"}} value={"ban"}><ScrollArea>{props.members.map((element: string, id: number) => {return(<div key={id}> <input type={"checkbox"} id={element} onClick={() => console.log(element)}/><label>{element}</label> </div>)})}</ScrollArea></Tabs.Panel>
						<Tabs.Panel style={{color:"white"}} value={"mute"}><ScrollArea>{props.members.map((element: string, id: number) => {return(<div key={id}> {element} </div>)})}</ScrollArea></Tabs.Panel>
						<Tabs.Panel style={{color:"white"}} value={"kick"}><ScrollArea>{props.members.map((element: string, id: number) => {return(<div key={id}> {element} </div>)})}</ScrollArea></Tabs.Panel>
						<Tabs.Panel style={{color:"white"}} value={"unban"}><ScrollArea>{props.members.map((element: string, id: number) => {return(<div key={id}> {element} </div>)})}</ScrollArea></Tabs.Panel>
						<Tabs.Panel style={{color:"white"}} value={"unmute"}><ScrollArea>{props.members.map((element: string, id: number) => {return(<div key={id}> {element} </div>)})}</ScrollArea></Tabs.Panel>
					</Tabs>
					{/*<img src="/account_decoration_down.svg" alt="" />*/}
					<Box>
						{<button className="btn_createChannel">
							<div className="btn__content_createChannel">{props.modalTypeOpen !== "add" ? "Confirm" : "Add Members"}</div>
						</button>}
					</Box>
					<Box>
						<button className="btn_close" onClick={() => props.setModalTypeOpen(null)}>
							<div className="btn_close__content">Close</div>
						</button>
					</Box>
				</div>
			</Modal>
		</>
	)
}