import React, { useEffect, useLayoutEffect, useState } from "react"
import { Box, Collapse, TransferListData, ActionIcon, Button, Center } from "@mantine/core";
import { IconArrowBigDown, IconArrowBigTop } from '@tabler/icons';
import OptionsPanel from "./OptionsPanel";

export default function ChannelStatus(props: any) {

	async function getChannelMembers() {
		const API_GET_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/allmembers/${props.room.name}`;
		if (props.room.name !== '') {
			let response = await fetch(API_GET_MEMBERS);
			let data = await response.json();
			//console.log("data: ", data)
			let fetchMember: string[] = [];
			await Promise.all(await data?.map(async (element: any) => {
				let iMember:string = element.nickname;
				fetchMember.push(iMember);
			}))
			props.setMembers(fetchMember);
		}
	}

	useLayoutEffect(() => {getChannelMembers()}
		, [props.room.name]
	)

	return (
		<div style={{position:"relative", height:"100%", backgroundColor:"darkred", width:"20%"}}> 
			{props.room.name && props.members.map((element: string, id: number) => {return(<div style={{width:"100%", height:"10%"}}key={id}> {element} </div>)})}
		</div>
	)
}
