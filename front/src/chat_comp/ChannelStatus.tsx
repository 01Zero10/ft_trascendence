import { Indicator } from "@mantine/core";
import React, { useEffect, useLayoutEffect } from "react"
import { useNavigate } from "react-router-dom";
import "./ChannelStatus_style.css"

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

	return (
		<div style={{height:"100%", width:"20%", display:"flex", flexDirection:"column"}}>
			<div className="membersList_header">
				<div style={{height:"70%", width:"100%", borderBottom:"2px solid #781C9C"}}></div>
				<div style={{height:"30%", width:"100%", borderLeft:"5px solid #781C9C"}}></div>
			</div>
			<div style={{position:"relative", height:"92%", backgroundColor:"black", color:"white", width:"100%", borderLeft:"5px solid #781C9C", borderBottom:"5px solid #781C9C", borderBottomLeftRadius:" 15px"}}>
				{props.room.name &&<div style={{width:"90%", height:"10%"}} onClick={() => navigate(("/users/" + props.room.builder.username))}>
					<Indicator color="green" size={12} processing>
						{props.room.builder.username}
					</Indicator>
				</div>}
				{props.room.name && props.members.map((element: string, id: number) => {return(
					// \/
					<div style={{width:"100%", height:"10%", display:"flex"}} key={id}>
						<div style={{width:"80%", height:"10%"}} onClick={() => navigate(("/users/" + element))} >{element}</div>
						{/* <Indicator color="green" size={12} processing> */}
							<div style={{width:"10%", height:"10%"}}>
							</div>
						{/* </Indicator> */}
						{(props.admins && props.admins.indexOf(element) !== -1) && <div style={{width:"10%", height:"10%"}}>admin</div>} 
					</div>)})}
			</div>
		</div>
	)
}
