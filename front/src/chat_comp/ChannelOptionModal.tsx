import { Box, Center, FocusTrap, Modal, MultiSelect, PasswordInput, SegmentedControl } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { NetworkPing, PropaneSharp, Room, Tune } from "@mui/icons-material";
import { IconLock, IconShield, IconWorld } from "@tabler/icons";
import React, {useContext, useEffect, useLayoutEffect, useState} from "react"
import { Student } from "../App";
import { NewChannel } from "./CreateChannel";
import "./ChannelOptionModal_stye.css"




export default function ChannelOptionModal(props: any) {
    const contextData = useContext(Student);
    const newOption_basic = {
        builder: props.room.builder,
        nameGroup: "",
        members: [],
        admin: [],
        type: props.room.type,
        password: '',
        confirmPass: ''
    }
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
    const [newOption, setNewOption] = useState<NewChannel>({...newOption_basic});
    const [btnDisabled, setBtnDisabled] = useState(true)
    const [visible, { toggle }] = useDisclosure(false);
    const [members, setMembers] = useState<{value: string, label: string}[]>([])
    //const [admins, setAdmins] = useState<string[]>([])
    const [optionsFriends, setOptionsFriends] = useState<{ value: string, label: string }[]>([{ value: "", label: "" }]);

    async function getChannelMembers() {
		const API_GET_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/allmembersandstatus/${props.room.name}`;
		if (props.room.name) {
			let response = await fetch(API_GET_MEMBERS);
			let data = await response.json();
			let fetchMember: {value: string, label: string}[] = [];
			// let fetchMember: string[] = [];
			await Promise.all(await data?.map(async (element: any) => {
				// let iMember: string = element.nickname;
                
				let iMember: {value: string, label: string} = {value: element.username, label: element.nickname}
				if(element.username !== props.room.builder.username)
					fetchMember.push(iMember);
			}))
			setMembers(fetchMember);
		}
	}


    useLayoutEffect(() =>{
        setNewOption({...newOption_basic, 
                        type: props.room.type,  
                        builder: props.room.builder})
        getChannelMembers()
    }, [props.room.name])

    useLayoutEffect(() => {
        if (props.members)
            setNewOption((prevChOptions: NewChannel) => {
                return ({
                    ...prevChOptions,
                    members: [...props.members],
                })})
            }    , [props.members])

    useLayoutEffect(() => {
            setNewOption((prevChOptions: NewChannel) => {
                return ({
                    ...prevChOptions,
                    admin: [...props.admins], 
                })})
    } , [props.admins])

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
        getListFriend().then();
    }, [])

    async function getRoomAdmins() {
		if (props.room.name && props.room.name !== '') {
			const API_GET_ADMINS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/admins/${props.room.name}`;
            let response = await fetch(API_GET_ADMINS);
            let data = await response.json();
            let fetchAdmins: string[] = [];
            await Promise.all(await data.map(async (element: any) => {
                let iMember: string = element.username
                fetchAdmins.push(iMember);
            }))
            props.setAdmins(fetchAdmins);
        }
	}

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
        });
        setBtnDisabled(false);
    }

    function changeAdmin(adminList: string[]) {
        setNewOption((prevChOptions: NewChannel) => {
            return ({
                ...prevChOptions,
                admin: adminList,
            })
        });
        setBtnDisabled(true);
        for (let element of newOption.admin) {
            if (props.admins.indexOf(element) === -1)
                setBtnDisabled(false)
        }
    }

    async function handleButtonClick() {
        //modifica il canale
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
                    adminsSetted: newOption.admin,
                })
            })
        // if(newOption.admin.length !== props.admins){
        //     const API_GET_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/editUsers`;
        //     await fetch(API_GET_MEMBERS, {
        //         credentials: 'include',
        //         headers: { 'Content-Type': 'application/json' },
        //         method: 'POST',
        //         body: JSON.stringify({ data: newOption.admin, channelName: props.room.name })
        //     })}
        }

        // aggiunge utenti
        if (props.modalTypeOpen === "add"){
            const API_ADD_MEMBERS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/addMembers`;
            await fetch(API_ADD_MEMBERS, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nameChannel: props.room?.name, newMembers: newOption.members }),
            })
        setBtnDisabled(false)
	}
		props.setModalTypeOpen(null)
        setNewOption({...newOption_basic})
	}


    useEffect( () =>
        {
            getRoomAdmins().then()
        }
        , [props.room.name]
    )

    function handleAdminsChange(value: string[]){
        setBtnDisabled(true)
        let tmp = [...newOption.admin]
        for (let element of value) {
            let indx = newOption.admin.indexOf(element)
            if ((indx === -1 && newOption.type !== 'protected') || (indx === -1 && newOption.type === 'protected' && newOption.password && newOption.confirmPass) || (indx === -1 && props.room.type === 'protected')){
                tmp.push(element);
                setBtnDisabled(false)
            }
        }
        for (let element of newOption.admin){
            let indx = value.indexOf(element)
            if ((indx === -1 && newOption.type !== 'protected') || (indx === -1 && newOption.type === 'protected' && newOption.password && newOption.confirmPass) || (indx === -1 && props.room.type === 'protected')){
                tmp.splice(tmp.indexOf(element), 1)
                setBtnDisabled(false)
            }
        }
        setNewOption((prevState) => {
            return {...prevState, admin: tmp}
        })
    }

    useEffect(() => {
        setBtnDisabled(true)

        //TODO:MANCA CONTROLLO ADMIN CHANGE, PER IL RESTO FUNZIONA

        if (newOption.type !== props.room.type && newOption.type !== 'protected')
            setBtnDisabled(false)

        if (props.room.type === 'protected' && newOption.type !== 'protected')
            setBtnDisabled(false)

        if (newOption.nameGroup && newOption.nameGroup !== props.room.name){
            if (newOption.type !== 'protected')
                setBtnDisabled(false)
            else if (newOption.password && newOption.password === newOption.confirmPass)
                setBtnDisabled(false)
        }

        if (newOption.nameGroup && newOption.nameGroup !== props.room.name && props.room.type === 'protected'){
                setBtnDisabled(false)
        }

        if ((newOption.type === 'protected' && newOption.password && newOption.password === newOption.confirmPass) 
            || (props.room.type === 'protected' && newOption.password && newOption.password === newOption.confirmPass))
                setBtnDisabled(false)
    }, [newOption.nameGroup, newOption.password, newOption.confirmPass, newOption.type])



    // useEffect(() => {
    //     setBtnDisabled(true)
    //     if (newOption.type && newOption.type !== 'protected' && newOption.type !== props.room.type)
    //         setBtnDisabled(false)
    //     // if (newOption.type && newOption.type === 'protected'){
    //     //     if (newOption.password && newOption.password === newOption.confirmPass)
    //     //         setBtnDisabled(false)
    //     // }
    //     console.log("--> newOption.type: ",newOption.type)
    // }, [newOption.type])


    // useEffect(() => {
    //     //TODO: fa cagare
    //     if (newOption.type !== props.room.type){
    //         if(newOption.type === "protected"){
    //             if(newOption.password && newOption.password === newOption.confirmPass){
    //                 setBtnDisabled(false)
    //             }
    //             else{
    //                 setBtnDisabled(true)
    //             }
    //         }
    //         else{
    //             setBtnDisabled(false)
    //         }
    //     }
    //     if(newOption.nameGroup !== ""){
    //         if (newOption.type !== props.room.type){
    //             if(newOption.type === "protected"){
    //                 if(newOption.password && newOption.password === newOption.confirmPass){
    //                     setBtnDisabled(false)
    //                 }
    //                 else{
    //                     setBtnDisabled(true)
    //                 }
    //             }
    //             else
    //                 setBtnDisabled(false)
    //         }
    //         else
    //             setBtnDisabled(false)
    //     }
    //     // if(newOption.nameGroup === "")
    //         // setBtnDisabled(true)
    //     if(newOption.members.length !== 0)
    //         setBtnDisabled(false)
    //     if(newOption.admin.length !== props.admins.length)
    //         setBtnDisabled(false)
    // }, [newOption]
    // )

    return (
        <Modal centered withCloseButton={false} closeOnClickOutside={false} zIndex={1500} overlayBlur={5}
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
            },
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
                    <FocusTrap><input type="" style={{width:"0", height:"0", border:"none"}} /></FocusTrap>
                    <img src="/account_decoration_top.svg" alt="" />
                    {props.modalTypeOpen === "options" && <div className="search_container">
                        <input  maxLength={18}
								className="search_input" 
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
                        {props.modalTypeOpen === "options" && <MultiSelect style={{ width:"90%", margin:"auto"}} 
                            data={members}
                            value={newOption.admin}
                            placeholder={"Select Admins"}
                            searchable
                            dropdownPosition="bottom"
                            nothingFound="NON CI SONO PERSONE"
                            onChange={handleAdminsChange}>
                        </MultiSelect>}
                    </div>
                    <Box>
                    {<button className="btn_confirmChannel" onClick={handleButtonClick} disabled={btnDisabled}>
                        <div className="btn__content_confirmChannel">{props.modalTypeOpen !== "add" ? "Confirm" : "Add Members"}</div>
                    </button>}
                    </Box>
                    <Box>
                        <button className="btn_close" onClick={() => {
                            props.setModalTypeOpen(null); 
                            setNewOption({...newOption_basic}); 
                            setBtnDisabled(true);
                            }}>
                            <div className="btn_close__content">Close</div>
                        </button>
                    </Box>
                </div>
            </Modal>
    )
}