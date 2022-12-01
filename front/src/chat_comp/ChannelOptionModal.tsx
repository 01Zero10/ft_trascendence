import { Box, Center, Modal, MultiSelect, PasswordInput, SegmentedControl } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PropaneSharp } from "@mui/icons-material";
import { IconLock, IconShield, IconWorld } from "@tabler/icons";
import React, { useContext, useEffect, useState } from "react"
import { Student } from "../App";
import { NewChannel } from "./CreateChannel";


export default function ChannelOptionModal(props: any) {
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
        nameGroup: "",
        members: [],
        type: props.room.type,
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


    // async function handleConfirm() {
    //     await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/chat/createGroupChat2`, {
    //         method: 'POST',
    //         credentials: 'include',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             builder: newOption.builder,
    //             nameGroup: newOption.nameGroup,
    //             members: newOption.members,
    //             type: newOption.type,
    //             password: newOption.confirmPass
    //         }),
    //     })
    //     props.socket?.emit('updateList', { type: `${newOption.type}` })
    //     setNewOption((prevChOptions: NewChannel) => {
    //         return ({
    //             ...prevChOptions,
    //             builder: contextData.username,
    //             nameGroup: '',
    //             members: [],
    //             type: 'public',
    //             confirmPass: '',
    //             password: ''
    //         })
    //     })
    //     props.setNewChannel(false)
    // }


    async function handleButtonClick() {
        if (props.modalTypeOpen === "options"){
		const API_EDIT_CHAT = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/editChannel`;
		await fetch(API_EDIT_CHAT, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				channelName: props.room.name,
				type: newOption.type,
				password: newOption.confirmPass,
				newName: newOption.nameGroup,
			})
		})
		const API_GET_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/editUsers`;
		await fetch(API_GET_MEMBERS, {
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			method: 'POST',
			body: JSON.stringify({ data: newOption.members, channelName: props.room.name })
		})}
        if (props.modalTypeOpen === "add"){
		const API_ADD_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/addMembers`;
		await fetch(API_ADD_MEMBERS, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ nameChannel: props.room?.name, newMembers: newOption.members }),
		})

	}
		props.setModalTypeOpen(null)
	}

    return (
        <Modal centered withCloseButton={true} closeOnClickOutside={false}
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
            opened={props.opened} onClose={ () => props.setModalTypeOpen(null) }>
                <div>
                    <div style={{width:"100%"}}>
                        {props.modalTypeOpen === "options" &&  <SegmentedControl style={{width:"100%",height: "50px"}} value={newOption.type} data={controlData} onChange={changeType}
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
                        })}/>}
                    </div> 
                    <img src="/account_decoration_top.svg" alt="" />
                    {props.modalTypeOpen === "options" && <div className="search_container">
                        <input  className="search_input" 
                                placeholder={props.room.name}
                                type="text"
                                autoComplete="off"
                                value={newOption.nameGroup}
                                onChange={(e) => changeName(e.target.value)}
                        />
                    </div>}
                    <img src="/account_decoration_down.svg" alt="" />
                    {(newOption.type === "protected" && props.modalTypeOpen === "options") && <form style={{ display:"flex", background:"transparent",width:"100%", height:"50%", color:"#ffff", margin:"10px auto 10px", padding:"11px"}} >
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
                        {props.modalTypeOpen === "add" && <MultiSelect style={{ width:"90%", margin:"auto"}} 
                            data={optionsFriends}
                            value={newOption.members}
                            placeholder={"Add members"}
                            searchable
                            dropdownPosition="bottom"
                            nothingFound="NIENTE, NON HAI AMICI"
                            onChange={changeMembers}>
                        </MultiSelect>}
                    </div>
                    <Box>
                    {<button className="btn_createChannel" onClick={handleButtonClick}>
                        <div className="btn__content_createChannel">{props.modalTypeOpen !== "add" ? "Confirm" : "Add Members"}</div>
                    </button>}
                    </Box>
                </div>
            </Modal>
    )
}