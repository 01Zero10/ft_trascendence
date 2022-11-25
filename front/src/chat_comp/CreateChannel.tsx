import { BackgroundImage, Box, Button, Center, Divider, FocusTrap, Input, Modal, MultiSelect, PasswordInput, SegmentedControl, Slider, Stack, TextInput } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { width } from "@mui/system";
import { IconLock, IconPassword, IconShield, IconWorld } from "@tabler/icons";
import { url } from "inspector";
import { type } from "os";
import { stringify } from "querystring";
import React, { useContext, useEffect, useState } from "react"
import { Student } from "../App";


export interface NewChannel {
    builder: string,
    nameGroup: string,
    members: string[],
    type: string,
    password: string,
    confirmPass: string
}

export default function CreateChannel(props: any) {
    const contextData = useContext(Student);
    const controlData = [
        { label: (
            <Center>
              <IconWorld size={16} />
              <Box ml={10}>Public</Box>
            </Center>
          ), value: 'public' },
        { label: (
            <Center>
                <IconShield size={16}></IconShield>
                <Box ml={10}>Protected</Box>
            </Center>
          ), value: 'protected' },
        { label: (
            <Center>
              <IconLock size={16} />
              <Box ml={10}>Private</Box>
            </Center>
          ), value: 'private' },
    ]
    const [newOption, setNewOption] = useState<NewChannel>({
        builder: contextData.username,
        nameGroup: '',
        members: [],
        type: 'public',
        password: '',
        confirmPass: ''
    });
    const [pass, setPass] = useState("")
    const [visible, { toggle }] = useDisclosure(false);

    const [optionsFriends, setOptionsFriends] = useState<{ value: string, label: string }[]>([{ value: "", label: "" }]);

    useEffect(() => {
        const API_GET_LIST_FRIEND = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/getListFriends/${contextData.username}`;
        const getListFriend = async () => {
            const fetchOptions: { value: string, label: string }[] = [];
            await fetch(API_GET_LIST_FRIEND, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            })
                .then((response) => response.json())
                .then(async (result) => {
                    await Promise.all(await result.map(async (element: string) => {
                        fetchOptions.push({ value: element, label: element });
                    }))
                    setOptionsFriends(fetchOptions);
                })
        }
        getListFriend();
    }, [])

    function changeType(value: string) {
        setNewOption((prevChOptions: NewChannel) => {
            return ({
                ...prevChOptions,
                type: value,
                password: '',
                confirmPass: ''
            })
        })
    }

    function changeName(name: string) {
        setNewOption((prevChOptions: NewChannel) => {
            return ({
                ...prevChOptions,
                nameGroup: name
            })
        })
    }

    function changePassword(pass: string) {
        setNewOption((prevChOptions: NewChannel) => {
            return ({
                ...prevChOptions,
                password: pass
            })
        })
    }

    function changeConfirmPass(pass: string) {
        setNewOption((prevChOptions: NewChannel) => {
            return ({
                ...prevChOptions,
                confirmPass: pass
            })
        })
    }

    function changeMembers(membersList: string[]) {
        setNewOption((prevChOptions: NewChannel) => {
            return ({
                ...prevChOptions,
                members: membersList,
            })
        })
    }

    function checkProtectedChannel() {
        if (newOption.type === 'protected' && newOption.confirmPass === '') {
            return false;
        }
        else if (newOption.type === 'protected' && newOption.confirmPass !== '' && newOption.confirmPass !== newOption.password)
            return false;
        else
            return true;
    }


    async function handleConfirm() {
        await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/chat/createGroupChat2`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                builder: newOption.builder,
                nameGroup: newOption.nameGroup,
                members: newOption.members,
                type: newOption.type,
                password: newOption.confirmPass
            }),
        })
        props.socket?.emit('updateList', { type: `${newOption.type}` })
        setNewOption((prevChOptions: NewChannel) => {
            return ({
                ...prevChOptions,
                builder: contextData.username,
                nameGroup: '',
                members: [],
                type: 'public',
                confirmPass: '',
                password: ''
            })
        })
    	//console.log("sono passato di qui")
        props.setCreateChan(false)
    }

    console.log(optionsFriends)

/*root	.mantine-Modal-root	Root element, contains modal and overlay
inner	.mantine-Modal-inner	Modal wrapper, centers modal
modal	.mantine-Modal-modal	Modal root
header	.mantine-Modal-header	Modal header, contains close button and title
overlay	.mantine-Modal-overlay	Overlay
title	.mantine-Modal-title	Modal title
body	.mantine-Modal-body	Modal body, displayed after header
close	.mantine-Modal-close	Close button*/

    return (
        <Modal centered 
        styles={(root) => ({
            inner:{
                backgroundColor: 'transparent',
            },
            modal: {
                backgroundColor: 'transparent',
            },
            header: {
                backgroundColor: 'transparent',
                textAlign: 'center',
                backgroundImage:'url("/account_decoration_down.svg")',
                BackgroundSize:"contain",
                backgroundRepeat:"no-repeat"
                
            },
            body:{
                width:"70%",
                height:"70%",
                backgroundColor: 'transparent',
                textAlign: 'center',
            }
        })} 
            opened={props.newChannel} onClose={ () => props.setNewChannel(false) }>
                <div style={{backgroundImage:"/chip.svg" , backgroundSize:"cover", backgroundPosition:"center"}}>
                    <div style={{width:"100%"}}>
                        <SegmentedControl style={{width:"100%"}} value={newOption.type} data={controlData} onChange={changeType} ></SegmentedControl>
                    </div> 
                    <img src="/account_decoration_top.svg" alt="" />
                    <div>
                        <Input styles={(root) => (
                            {input:{color:"white"}})}
                            variant="unstyled"
                            placeholder="Channel Name"
                            radius="md"
                        />
                    </div>
                    <img src="/account_decoration_down.svg" alt="" />
                    {newOption.type === "protected" && <form style={{ display:"flex", background:"transparent",width:"100%", height:"50%", color:"#ffff"}} >
                            <PasswordInput styles={() => ({label:{color:"#781C9C"}})} style={{ margin:"auto", width:"45%"} } disabled={newOption.type !== "protected"}
                                label="Password"
                                value={newOption.password}
                                visible={visible}
                                onVisibilityChange={toggle}
                                onChange={(e) => changePassword(e.target.value)}
                            />
                            <PasswordInput
                                styles={() => ({label:{color:"#781C9C"}})}
                                style={{ margin:"auto", width:"45%"} }
                                label="Confirm password"
                                value={newOption.confirmPass}
                                visible={visible}
                                onVisibilityChange={toggle}
                                display={newOption.password}
                                error={newOption.password !== newOption.confirmPass && "non corrispondono coglione!"}
                                onChange={(e) => changeConfirmPass(e.target.value)}
                            />
                    </form>}
                    
                    <div>
                        <MultiSelect data={optionsFriends} value={newOption.members} placeholder={"Add members"}></MultiSelect>
                    </div>
                    <Button style={{ width:"100%" }} >ciao</Button>
                </div>
            </Modal>
    )
}