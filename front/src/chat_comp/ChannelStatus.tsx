import { Indicator } from "@mantine/core";
import React, { useEffect, useLayoutEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import "./ChannelStatus_style.css"
import {green} from "@mui/material/colors";
import { IconCrown } from "@tabler/icons";

export default function ChannelStatus(props: any) {
	const navigate = useNavigate()
	const [online, setOnline] = useState("red");
	const [ownerOnline, setOwnerOnline] = useState<boolean>(false);

	// useEffect(() => {
	// 	setOnline("green");
	// },[])


	async function getChannelMembers() {
		const API_GET_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/allmembersandstatus/${props.room.name}`;
		if (props.room.name) {
			let response = await fetch(API_GET_MEMBERS);
			let data = await response.json();
			//console.log("data: ", data)
			let fetchMember: {nickname: string, status: boolean}[] = [];
			// let fetchMember: string[] = [];
			await Promise.all(await data?.map(async (element: any) => {
				// let iMember: string = element.nickname;
				let iMember: {nickname: string, status: boolean} = {nickname : element.nickname, status: element.status ? true : false}

				if(element.nickname !== props.room.builder.username)
					fetchMember.push(iMember);
				else
					setOwnerOnline(element.status ? true : false);
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

	useEffect(() => {
		props.socket?.on('updateListMembers', async() => {
				await getChannelMembers();
		});
	}, [props.socket, props.members]);

	useEffect(() => {
		props.socket?.on('updateListMembers', async(nameChannel: string) => {
			if (props.room.name == nameChannel)
				await getChannelMembers();
		});
	}, [props.socket]);

	useLayoutEffect(() => {
		getChannelMembers()
		getRoomAdmins()
	}, [props.room.name]
	)

	useEffect(() => {
		console.log(props.members);
	}, [props.members])

	return (
		<div style={{height:"100%", width:"20%", display:"flex", flexDirection:"column", fontFamily:"'Tomorrow', sans-serif", fontWeight:"400", fontSize:"0.95rem"}}>

			{props.room.type === 'direct' ?
				<><div className="membersList_header">
					<div style={{height:"70%", width:"100%", borderBottom:"2px solid #781C9C"}}></div>
					<div style={{height:"30%", width:"100%", borderLeft:"5px solid #781C9C"}}></div>
				</div>
				<div className={"directMessageStatus"}></div></> :
			<>
			<div className="membersList_header">
				<div style={{height:"70%", width:"100%", borderBottom:"2px solid #781C9C"}}></div>
				<div style={{height:"30%", width:"100%", borderLeft:"5px solid #781C9C"}}></div>
			</div>

			<div style={{position:"relative", height:"92%", backgroundColor:"black", color:"white", width:"100%", borderLeft:"5px solid #781C9C", borderBottom:"5px solid #781C9C", borderBottomLeftRadius:" 15px"}}>
				{props.room.name && <div className={"divNameContainer"}>
					<div className={"divNameContainer_content"} onClick={() => navigate(("/users/" + props.room.builder.username))}>
						{ownerOnline ? <Indicator color={"green"} size={14} processing position={"middle-end"} zIndex={0}> <p className={"divNameContent_name"}>{props.room.builder.username}</p></Indicator> :
							<Indicator color={"red"} size={14} processing position={"middle-end"} zIndex={0}> <p className={"divNameContent_name"}>{props.room.builder.username}</p></Indicator>}
					</div>
					<div style={{width:"10%", marginLeft:"10%", display:"flex", alignItems:"center", justifyContent:"center"}}><IconCrown></IconCrown></div>
				</div>}
				{props.room.name && props.members?.map((element: {nickname: string, status: boolean}, id: number) => {return(
					<div className={"divNameContainer"} key={id}>
						<div className={"divNameContainer_content"} onClick={() => navigate(("/users/" + element.nickname))}>
							{element.status ? <Indicator color={"green"} size={14} processing position={"middle-end"} zIndex={0}> <p className={"divNameContent_name"}>{element.nickname}</p></Indicator> :
								<Indicator color={"red"} size={14} processing position={"middle-end"} zIndex={0}> <p className={"divNameContent_name"}>{element.nickname}</p></Indicator>}
						</div>
						{(props.admins && props.admins.indexOf(element.nickname) !== -1) && <div style={{width:"10%", marginLeft:"10%"}}>admin</div>}
					</div>)})}
			</div>
			</>}
		</div>
	)
}
