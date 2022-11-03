import React, { useContext } from "react";
import { useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatBody from "./ChatBody";
import { Student } from "../App";
import Textbox from "./Textbox";
// import Button from "./Button";
import { Modal, Button, Group } from '@mantine/core';



export default function ChatGroup(props: any) {
    //let arr = ["ciao", "miao", "bau", "ciao1", "miao1", "bau1", "ciao2", "miao2", "sklfgnldksfnbljkjk"]
    //
    const contextData = useContext(Student);
    const [src, setSrc] = React.useState("")
    const [groupName, setGroupName] = React.useState("")
    const [groupMembers, setGroupMembers] = React.useState<string[]>([])
    const [name, setName] = React.useState(false)
    const [password, setPassword] = React.useState({
        pass: false,
        password: ""
    })
    const [options_, setOptions_] = React.useState<string[]>([])
    //console.log("name: ", name);


    function setPass(e: React.ChangeEvent<HTMLInputElement>) {
        setPassword((prevPassword) => ({
            ...prevPassword,
            password: e.target.value
        })
        )
    }

    function handlePass() {
        setName(true)
        setPassword((prevPassword) => ({
            ...prevPassword,
            pass: true,
        }))
    }

    useEffect(() => {
        async function getUsersOnDB() {
            let respose = await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getuod`);
            let data = await respose.json();
            setOptions_([]);

            data.forEach((element: any) => {
                if (element.username != contextData.username)
                    setOptions_((prevOptions) => [...prevOptions, element.username])
            });
            //console.log("options===", options_);
        }
        getUsersOnDB();
    }, [groupName]);


    function search(e: React.ChangeEvent<HTMLInputElement>) {
        setSrc(e.target.value)
    }

    async function getGroupName() {
        if (name === true) {
            await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/chat/createGroupChat`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ builder: props.client, nameGroup: groupName, members: groupMembers, pwd: password.password }),
            })
            props.setGruppo(false)
            props.socket?.emit('updateList', { type: 'public' })
        }

    }

    function gn(e: React.ChangeEvent<HTMLInputElement>) {
        setGroupName(e.target.value)
    }

    return (
        <>
            <div id="crea-gruppo" className={(props.status === "chiusa" ? " chiuso" : "") + (!groupName ? " extended" : "")}>
                <ChatHeader id="user"
                    main={props.main}
                    setGruppo={props.setGruppo}
                    gruppo={props.gruppo}
                    gName={name ? groupName : ""}
                    status={props.status}
                    close={props.close}
                    setGroupName={setGroupName}
                />
                {!name && <div id="helper1">Choose the group name!</div>}
                {(!name) && <Textbox
                    id="group-name"
                    type="text"
                    placeholder=" Write your group name here!"
                    value={groupName}
                    handleChange={gn}
                />}
                {(groupName && !password.pass) && <Textbox
                    id="group-pass"
                    type="password"
                    placeholder="Write your password! (if you want one)"
                    value={password.password}
                    handleChange={setPass}
                />}
                {(groupName && password.pass) && <Textbox
                    id="group-search"
                    type="text"
                    placeholder="Search who you wanna add!"
                    value={src}
                    handleChange={search}
                />}
                {/* /////////////////////////////////////////////////////////////////////////// */}
                {!name && <div id="helper2" className={(!groupName ? "extended" : "short")}></div>}
                {name && <ChatBody main={props.main}
                    closed={props.close}
                    arr={options_}
                    groupMembers={groupMembers}
                    setGroupMembers={setGroupMembers}
                    src={src} />}
                {groupName && <div id="crea">
                    {!password.pass && <button id="avanti" onClick={handlePass}>AVANTI"</button>}
                    {password.pass && <button id="create-group" onClick={getGroupName}>CREA GRUPPO</button>}
                </div>}
            </div>
        </>
    )
}