import { Box, Center, Modal, MultiSelect, PasswordInput, SegmentedControl } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLock, IconShield, IconWorld } from "@tabler/icons";
import React, { useContext, useEffect, useState } from "react"
import { Student } from "../App";
import { NewChannel } from "./CreateChannel";


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
        //props.setCreateChan(false)
        props.setNewChannel(false)
    }

    //console.log(optionsFriends)

/*root	.mantine-Modal-root	Root element, contains modal and overlay
inner	.mantine-Modal-inner	Modal wrapper, centers modal
modal	.mantine-Modal-modal	Modal root
header	.mantine-Modal-header	Modal header, contains close button and title
overlay	.mantine-Modal-overlay	Overlay
title	.mantine-Modal-title	Modal title
body	.mantine-Modal-body	Modal body, displayed after header
close	.mantine-Modal-close	Close button*/

    return (
        <Modal centered withCloseButton={false} closeOnClickOutside={false}
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
            </Modal>
    )
}