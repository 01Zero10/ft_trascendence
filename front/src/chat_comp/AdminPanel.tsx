import { Button, Input, NumberInput, SegmentedControl, TextInput, TransferList, TransferListData } from "@mantine/core";
import { IconAt, IconClock } from "@tabler/icons";
import React, { SetStateAction, useEffect, useLayoutEffect, useState } from "react"

export default function AdminPanel(props: any) {

	/*TODO: implementare bene con owner
	con il pulsante admin la stanza e' sbagliata*/

	//🔇🚫

	//console.log("srranzoa", props.room.name);
	//variabili
	const [action, setAction] = useState<string>('ban');
	const [data, setData] = useState<TransferListData>([[], []]);
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
		if (props.room.name != '') {
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

	return (
		<div className={"owner-panel"}>
			<div className="mute-ban-text">Mute or ban someone in {props.room.name}</div>
			<SegmentedControl
				value={action}
				onChange={setAction}
				fullWidth
				color="grape"
				radius={"xl"}
				transitionDuration={350}
				data={[
					{ label: 'Ban', value: 'ban' },
					{ label: 'Mute', value: 'mute' },
					{ label: 'Kick', value: 'kick' },
				]}
			/>
			<TransferList
				style={{ transition: "0" }}
				showTransferAll={false}
				value={data}
				nothingFound="No one here"
				searchPlaceholder="Search..."
				breakpoint="sm"
				onChange={setData}
				radius={"md"}
			/>
			<div className="mute-ban-text">Choose a duration (in seconds)</div>
			<NumberInput
				icon={<IconClock />}
				placeholder="For how long?.."
				radius="lg"
				value={time}
				onChange={(val) => setTime(val)}
				step={10}
				min={10}
			/>
			<TextInput
				radius="lg"
				placeholder="What's the reason?"
				value={reason}
				onChange={(e) => setReason(e.target.value)}
			/>
			<br />
			<Button
				type="button"
				radius="lg"
				size="sm"
				fullWidth
				color="grape"
				onClick={handleMuteBan}
			//disabled={!checkSettings()}
			>Confirm
			</Button>
		</div>
	)
}