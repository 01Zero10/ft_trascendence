import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Student } from "../App";
import ChannelStatus from "./ChannelStatus";
import ChannelBody from "./ChannelBody";

export default function ChannelBodyStatus(props: any) {
    //---------------------ChannelBody States-----------------------
    const [joined, setJoined] = useState(false)
    //const [createChan, setCreateChan] = useState(false)
    const student = useContext(Student);
    //---------------------ChannelStatus States----------------------  
    const [adminOpen, setAdminOpen] = useState(true)
    const [userOpen, setUserOpen] = useState(true)

    //---------------------chat.tsx States----------------------
    const [admin, setAdmin] = useState<0 | 1 | 2>(0)

    const [members, setMembers] = useState<string[]>([]);
    const [admins, setAdmins] = useState<string[]>([]);

    // useLayoutEffect(() => {
    //     if (student.username === props.room.builder.username)
    //         setAdmin(2)
    //     else if (admins.findIndex((x) => x === student.username) !== -1)
    //         setAdmin(1)
    // }, [admins])

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

    return (
        <div style={{position:"relative", height:"100%", backgroundColor:"lime", width:"80%", display:"flex"}}>
            {<ChannelBody room={props.room} socket={props.socket} setRoom={props.setRoom}/>}
            <ChannelStatus room={props.room}></ChannelStatus>
        </div>
    )
}

// setCreateChan