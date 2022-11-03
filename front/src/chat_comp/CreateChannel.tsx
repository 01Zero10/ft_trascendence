import { Box, Button, Divider, FocusTrap, MultiSelect, PasswordInput, SegmentedControl, TextInput } from "@mantine/core"
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
    const [newOption, setNewOption] = useState<NewChannel>({
        builder: contextData.username,
        nameGroup: '',
        members: [],
        type: 'public',
        password: '',
        confirmPass: ''
    });

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
        if (newOption.type == 'protected' && newOption.confirmPass == '') {
            return false;
        }
        else if (newOption.type == 'protected' && newOption.confirmPass != '' && newOption.confirmPass != newOption.password)
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

    return (
        <Box sx={{ width: "100%", height: "100%", align: "center" }}>
            <Box sx={{ width: "100%", height: "10%" }}>
                <div className="mute-ban-text">Choose the group name</div>
                <FocusTrap>
                    <TextInput
                        value={newOption.nameGroup}
                        onChange={(e) => changeName(e.target.value)}
                        placeholder="Choose a group name!"></TextInput>
                </FocusTrap>
            </Box>
            <Box sx={{ width: "100%", height: "10%" }}>
                <br />
                <div className="mute-ban-text">Choose the channel type</div>
                <SegmentedControl onChange={changeType} fullWidth
                    color="grape"
                    radius={"xl"}
                    transitionDuration={350}
                    data={[
                        { label: 'Public', value: 'public' },
                        { label: 'Protected', value: 'protected' },
                        { label: 'Private', value: 'private' },
                    ]}
                />
            </Box>
            {(newOption.type == 'protected') && <Box sx={{ width: "100%", height: "20s%" }}>
                <div className="mute-ban-text">Type a password (make sure it's secret.. 🤭)</div>
                <br />
                <PasswordInput
                    placeholder="Set a Password"
                    onChange={(event) => changePassword(event.currentTarget.value)}
                >
                </PasswordInput>
                <PasswordInput
                    placeholder="Confirm Password"
                    onChange={(event) => changeConfirmPass(event.currentTarget.value)}
                    error={newOption.password === newOption.confirmPass ? false : "password don't match"}
                >
                </PasswordInput>
            </Box>}
            <Box sx={{ width: "100%", height: "10%" }}>
                <div className="mute-ban-text">Who do you want to add?</div>
                <MultiSelect
                    data={optionsFriends}
                    placeholder="Pick who you want to add.."
                    searchable
                    dropdownPosition="bottom"
                    clearButtonLabel="Clear selection"
                    // nothingFound="Nothing found" TODO: vedere BUG
                    value={newOption.members}
                    onChange={changeMembers}
                />
            </Box>
            <br />
            <Box>
                {(newOption.nameGroup) &&
                    <Button
                        size="lg"
                        radius="lg"
                        fullWidth variant="gradient"
                        gradient={{ from: 'orange', to: 'lime' }}
                        onClick={handleConfirm}
                        disabled={!checkProtectedChannel()}>
                        Conferma
                    </Button>}
            </Box>
        </Box>
    )
}