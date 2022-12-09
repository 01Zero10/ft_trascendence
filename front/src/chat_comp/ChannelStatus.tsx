import React, { useEffect, useLayoutEffect, useState } from "react"
import { Box, Collapse, TransferListData, ActionIcon, Button, Center } from "@mantine/core";
import { IconArrowBigDown, IconArrowBigTop } from '@tabler/icons';
import OptionsPanel from "./OptionsPanel";
import { useNavigate } from "react-router-dom";

export default function ChannelStatus(props: any) {
	const navigate = useNavigate()

	async function getChannelMembers() {
		const API_GET_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/allmembers/${props.room.name}`;
		if (props.room.name) {
			let response = await fetch(API_GET_MEMBERS);
			let data = await response.json();
			//console.log("data: ", data)
			let fetchMember: string[] = [];
			await Promise.all(await data?.map(async (element: any) => {
				let iMember:string = element.nickname;
				if(element.nickname !== props.room.builder.username)
					fetchMember.push(iMember);
			}))
			props.setMembers(fetchMember);
		}
	}

	    async function getRoomAdmins() {
        if (props.room.name && props.room.type != 'direct') {
            const API_GET_ADMINS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/admins/${props.room.name}`;
            if (props.room.name) {
                let response = await fetch(API_GET_ADMINS);
                let data = await response.json();
                let fetchAdmins: string[] = []

                await Promise.all(await data.map(async (element: any) => {
                    let iMember: string = element.username;
                    fetchAdmins.push(iMember);
                }))
                props.setAdmins(fetchAdmins);
            }
        }
    }



	useLayoutEffect(() => {
		getChannelMembers()
		getRoomAdmins()
	}, [props.room.name]
	)

	return (
		<div style={{position:"relative", height:"100%", backgroundColor:"darkred", width:"20%"}}> 
			{props.room.name &&<div style={{width:"90%", height:"10%"}} onClick={() => navigate(("/users/" + props.room.builder.username))}>{props.room.builder.username}</div>}
			{props.room.name && props.members.map((element: string, id: number) => {return(
				<div style={{width:"100%", height:"10%", display:"flex"}} key={id}> 
					<div style={{width:"80%", height:"10%"}} onClick={() => navigate(("/users/" + element))} >{element}</div>
					<div style={{width:"10%", height:"10%"}}>online</div>
					{(props.admins && props.admins.indexOf(element) !== -1) && <div style={{width:"10%", height:"10%"}}>admin</div>} 
				</div>)})}
		</div>
	)
}
