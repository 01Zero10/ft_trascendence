import { ActionIcon, Indicator, Menu } from '@mantine/core'
import { IconBell } from '@tabler/icons'
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Student } from './App'
import "./NotificationBell.css"

export interface iNotifications {
    sender: string,
    type: string,
    sentAt?: Date,
    seen: boolean,
}

export default function NotificationBell(props: any) {
    const contextData = useContext(Student);
    const [notifications, setNotifications] = useState<iNotifications[]>([]);
    const [seen, setSeen] = useState<number>(0);
    const [count, setCount] = useState<number>(0);
    let navigate = useNavigate();


    async function markSeen() {
        const NOTIFICATION_API = `http://${process.env.REACT_APP_IP_ADDR}:3001/navigation/notifications/seen`;
        await fetch(NOTIFICATION_API, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client: contextData.username })
        })
        setCount(0);
    }

    async function getNotifications() {
        const NOTIFICATION_API = `http://${process.env.REACT_APP_IP_ADDR}:3001/navigation/notifications/${contextData.username}`;
        let response = await fetch(NOTIFICATION_API, {
            credentials: "include",
        })
        let data = await response.json();
        let fetchNotifications: iNotifications[] = [];
        setSeen(0)
        await Promise.all(await data?.map(async (element: any) => {
            let singleNotification: iNotifications = {
                sender: element.sender,
                type: element.type,
                sentAt: element?.sentAt,
                seen: element.seen,
            }
            if (!element.seen)
                setSeen((prevState: number) => { return ++prevState });
            fetchNotifications.push(singleNotification);
        }))
        setNotifications(fetchNotifications);
    }

    async function handleAcceptGame(sender: string) {
        const API_URL_ACCEPT_GAME_REQUEST = `http://${process.env.REACT_APP_IP_ADDR}:3001/game/acceptGameRequest`;
        await fetch( API_URL_ACCEPT_GAME_REQUEST, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client: contextData.username, sender: sender })
        })
        navigate('/game');
    }

    useEffect(() => {
        getNotifications();
    }, [])

    useEffect(() => {
        props.socket?.on('updateBell', async () => {
            await getNotifications();
        });
    }, [props.socket])
    
    useEffect(() => {
        setCount(seen)
    }, [notifications])

    return (
        <div onClick={markSeen}>
            <Menu shadow="md" width={350} position="bottom-start">
                <Menu.Target>
                    <ActionIcon variant="transparent">
                        {/* showZero e dot sono false quando il count = 0; */}
                        { }
                        <Indicator label={String(count)} inline size={16} color={"red"} showZero={false} dot={false} processing>
                            <IconBell color='white' className={count !== 0 ? 'bell' : ""}></IconBell>
                        </Indicator>
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>Notifications menu</Menu.Label>
                    <Menu.Divider />
                    {notifications?.map((element, id) => (
                        (element.type !== 'game_request') ?
                        <Menu.Item key={id} component='a' href={'/users/' + element.sender} >• {element.type} request from {element.sender}!</Menu.Item> :
                        <Menu.Item key={id} onClick={() => handleAcceptGame(element.sender)}>• Game request from {element.sender} </Menu.Item>
                    ))}
                </Menu.Dropdown>
            </Menu>
        </div>
    )
}
