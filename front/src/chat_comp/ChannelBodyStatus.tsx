import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Student } from "../App";
import ChannelStatus from "./ChannelStatus";
import ChannelBody from "./ChannelBody";

// interfaccia per testare nickname e status
export interface element_status {
    username: string,
    nickname: string,
    status:boolean,
}
export default function ChannelBodyStatus(props: any) {
    const student = useContext(Student);
    const [admin, setAdmin] = useState(false)
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
                joined={props.joined}
                setJoined={props.setJoined}
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