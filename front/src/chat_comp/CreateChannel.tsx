import { BackgroundImage, Box, Button, Center, createStyles, Divider, FocusTrap, Input, Modal, MultiSelect, PasswordInput, SegmentedControl, Slider, Stack, TextInput } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { red } from "@mui/material/colors";
import { width } from "@mui/system";
import { IconLock, IconPassword, IconShield, IconWorld } from "@tabler/icons";
import { notDeepEqual } from "assert";
import { url } from "inspector";
import { type } from "os";
import { stringify } from "querystring";
import React, { useContext, useEffect, useState} from "react"
import { Student } from "../App";
import "./CreateChannel_style.css"

export interface NewChannel {
    builder: string,
    nameGroup: string,
    members: string[],
    admin: string[],
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
        admin:[],
        type: 'public',
        password: '',
        confirmPass: ''
    });
    const [pass, setPass] = useState("")
    const [visible, { toggle }] = useDisclosure(false);
    const [checkName, setCheckName] = useState<boolean>(false);

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
                    await Promise.all(await result.map(async (element: {username: string, nickname: string}) => {
                        fetchOptions.push({ value: element.username, label: element.nickname });
                    }))
                    setOptionsFriends(fetchOptions);
                })
        }
        getListFriend();
    }, [])

    function changeType(value: string) {
        setNewOption((prevNewOptions: NewChannel) => {
            return ({
                ...prevNewOptions,
                type: value,
                password: '',
                confirmPass: ''
            })
        })
    }

    async function changeName(name: string) {
        console.log("name",name)
        setNewOption((prevNewOptions: NewChannel) => {
            return ({
                ...prevNewOptions,
                nameGroup: name
            })
        })
        const API_CHECK_CHANNEL_NAME = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/checkChannelName/${name}`;
        if (name !== '') {
            const ret = await fetch(API_CHECK_CHANNEL_NAME, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            })
            .then((response) => response.json())
            setCheckName(ret.ret);
        }

    }

    function changePassword(pass: string) {
        setNewOption((prevNewOptions: NewChannel) => {
            return ({
                ...prevNewOptions,
                password: pass
            })
        })
    }

    function changeConfirmPass(pass: string) {
        setNewOption((prevNewOptions: NewChannel) => {
            return ({
                ...prevNewOptions,
                confirmPass: pass
            })
        })
    }

    function changeMembers(membersList: string[]) {
        setNewOption((prevNewOptions: NewChannel) => {
            return ({
                ...prevNewOptions,
                members: membersList,
            })
        })
    }

    function checkProtectedChannel() {
        if (checkName)
            return false;
        if (newOption.type === 'protected' && newOption.confirmPass === '') {
            return false;
        }
        else return !(newOption.type === 'protected' && newOption.confirmPass !== '' && newOption.confirmPass !== newOption.password);
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
        props.setNewChannel(false)
    }

    const handleKeyDown = (e: any) => {
		if (e.key === "?") {
		  e.preventDefault();
		}
	  };

/*root	.mantine-Modal-root	Root element, contains modal and overlay
inner	.mantine-Modal-inner	Modal wrapper, centers modal
modal	.mantine-Modal-modal	Modal root
header	.mantine-Modal-header	Modal header, contains close button and title
overlay	.mantine-Modal-overlay	Overlay
title	.mantine-Modal-title	Modal title
body	.mantine-Modal-body	Modal body, displayed after header
close	.mantine-Modal-close	Close button*/

    return (
        <Modal centered withCloseButton={false} closeOnClickOutside={false} overlayBlur={5}
        styles={(root) => ({
            inner:{
                backgroundColor: 'transparent',
            },
            modal: {
                backgroundColor: 'transparent',
                display: "flex",
                flexDirection:"column" ,
                alignItems:"center",
                justifyContent:"center",
                margin: 0,
            },
            body:{
                width:"100%",
                height:"80%",
                backgroundColor: 'transparent',
                textAlign: 'center',
            }
        })} 
            opened={props.newChannel} onClose={ () => props.setNewChannel(false) }>
                <div>
                    <div style={{width:"100%"}}>
                        <SegmentedControl style={{width:"100%",height: "50px"}}
                                          value={newOption.type}
                                          data={controlData}
                                          onChange={changeType}
                        styles={() => ({
                            root: {
                                backgroundColor:"transparent",
                            },
                            control: {
                                margin:"auto 2% auto",
                                height: "100%",
                                border:"0",
                                outline: "none",
                                backgroundColor: "#781C9C",
                                cursor: "pointer",
                                position: "relative",
                                color: "#fafafa",
                                clipPath: "polygon(92% 0, 100% 25%, 100% 100%, 8% 100%, 0% 75%, 0 0)",
                                '&:not(:first-of-type)':{
                                    border: "none",
                                }
                            },
                            active: {
                                backgroundColor:"transparent",
                            },
                            label: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "absolute",
                                fontFamily: "'Tomorrow', sans-serif",
                                fontSize: "0.95rem",
                                top: "2px",
                                left: "2px",
                                right: "2px",
                                bottom: "2px",
                                backgroundColor: "#050a0e",
                                clipPath: "polygon(92% 0, 100% 25%, 100% 100%, 8% 100%, 0% 75%, 0 0)",
                                '&:hover':{
                                    color:"#fafafa",
                                    backgroundColor: "#050a0ec6",
                                }
                            },
                            labelActive:{
                                color: "#fafafa !important", 
                            },
                            controlActive:{
                                backgroundColor: "#fafafa"
                            }
                        })}/>
                    </div> 
                    <img src="/account_decoration_top.svg" alt="" />
                    <div className="search_container">
                        {/* <Input className="search_input" styles={(root) => (
                            {input:{width:"90%",color:"white", margin:"10px auto -10px"}})}
                            variant="unstyled"
                            placeholder="Channel Name"
                            radius="md"
                        /> */}
                        <input  maxLength={18}
								className="search_input" 
                                placeholder="Channel name"
                                type="text"
                                autoComplete="off"
                                value={newOption.nameGroup}
                                onKeyDown={handleKeyDown}
                                onChange={async (e) => await changeName(e.target.value)}
                        />
                    </div>
                    <img src="/account_decoration_down.svg" alt="" />
                    {newOption.type === "protected" && <form style={{ display:"flex", background:"transparent",width:"100%", height:"50%", color:"#ffff", margin:"10px auto 10px", padding:"11px"}} >
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
                        <MultiSelect style={{ width:"90%", margin:"auto"}} 
                            data={optionsFriends}
                            value={newOption.members}
                            placeholder={"Add members"}
                            searchable
                            dropdownPosition="bottom"
                            nothingFound="NIENTE, NON HAI AMICI"
                            onChange={changeMembers}>
                        </MultiSelect>
                    </div>
                    <Box>
                    {(newOption.nameGroup && !checkName) && <button className="btn_createChannel" onClick={handleConfirm} disabled={!checkProtectedChannel()}>
                        <div className="btn__content_createChannel">Create Channel</div>
                    </button>}
                    </Box>
                </div>
            </Modal>
    )
}