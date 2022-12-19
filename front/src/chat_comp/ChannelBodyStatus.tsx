import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Student } from "../App";
import ChannelStatus from "./ChannelStatus";
import ChannelBody from "./ChannelBody";

// interfaccia per testare nickname e status
export interface element_status {
    nickname: string,
    status:boolean,
}
export default function ChannelBodyStatus(props: any) {
    const [joined, setJoined] = useState(false)
    const student = useContext(Student);
    //---------------------chat.tsx States----------------------
    const [admin, setAdmin] = useState(false)

    // const [members, setMembers] = useState<string[]>([]);
    const [members, setMembers] = useState<element_status[]>();
    const [admins, setAdmins] = useState<string[]>([]);

    useEffect(() => {
        if (student.username === props.room.builder.username)
            setAdmin(true)
        else if (admins.indexOf(student.username) !== -1)
            setAdmin(true)
        else
            setAdmin(false)
    }, [admins, props.room.name])

    // //chiude le liste in status 
    // useEffect(
    //     () => {
    //         if (!props.opened) {
    //             setAdminOpen(true)
    //             setUserOpen(true)
    //         } else {
    //             setAdminOpen(false)
    //             setUserOpen(false)
    //         }
    //     }, [props.chOptions]
    // )

	// //console.log("proooops = ", props.room);

    // async function getRoomAdmins() {
    //     if (props.room.name && props.room.name != '' && props.room.type != 'direct') {
    //         const API_GET_ADMINS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/admins/${props.room.name}`;
    //         if (props.chOptions?.name != '') {
    //             let response = await fetch(API_GET_ADMINS);
    //             let data = await response.json();
    //             let fetchAdmins: string[] = []

    //             await Promise.all(await data.map(async (element: any) => {
    //                 let iMember: string = element.username;
    //                 fetchAdmins.push(iMember);
    //             }))
    //             setAdmins(fetchAdmins);
    //         }
    //     }
    // }

    // async function getChatMembers() {
    //     if (props.room.name && props.room.name != '' && props.room.type != 'direct') {
    //         const API_GET_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/members/${props.room.name}`;
    //         let response = await fetch(API_GET_MEMBERS);
    //         let data = await response.json();
    //         let fetchMembers: string[] = []
    //         await Promise.all(await data.map(async (element: any) => {
    //             let iMember: string = element.username;
    //             fetchMembers.push(iMember);
    //         }))
    //         setMembers(fetchMembers);
    //     }
    // }

    // // popola array di admin e user (con type object{value, label})
    // useLayoutEffect(() => {
    //     async function getData() {
    //         await getChatMembers();
    //         await getRoomAdmins()
    //     }
    //     setAdmin(0)
    //     getData();
    // }, [props.room.name])
    // console.log("admin: ", admin)
    return (
        <div style={{position:"relative", height:"100%", backgroundColor:"black", width:"80%", display:"flex"}}>
            <ChannelBody 
                room={props.room} 
                socket={props.socket} 
                members={members?.map(element => element.nickname)}
                admins={admins}
                admin={admin}
                setAdmins={setAdmins}
                setMembers={setMembers}
                setRoom={props.setRoom}
                setCard={props.setCard}
                />
            <ChannelStatus 
                room={props.room}
				socket={props.socket}
                members={members}
                admins={admins}
                setAdmin={setAdmin}
                setAdmins={setAdmins}
                setMembers={setMembers}
            />
        </div>
    )
}

// setCreateChan