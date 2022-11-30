import { ActionIcon, Indicator, Menu } from '@mantine/core'
import { IconBell } from '@tabler/icons'
import { stringify } from 'querystring'
import React, { useState } from 'react'
import "./NotificationBell.css"

const notifications = [{ type: 'friendship', sender: 'dbalducc' }, { type: 'friendship', sender: 'lmizzoni' }];

export default function NotificationBell(props: any) {



    return (
        <Menu shadow="md" width={350} position="bottom-start">
            <Menu.Target>
                <ActionIcon variant="transparent">
                    {/* showZero e dot sono false quando il count = 0; */}
                    { }
                    <Indicator label={String(props.count)} inline size={16} color={"red"} showZero={false} dot={false} processing>
                        <IconBell color='white' className={props.count !== 0 ? 'bell' : ""}></IconBell>
                    </Indicator>
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>Notifications menu</Menu.Label>
                <Menu.Divider />
                {notifications.map((element) => (
                    <Menu.Item component='a' href={process.env.REACT_APP_IP_ADDR + 'users' + element.sender} >• {element.type} request from {element.sender}!</Menu.Item>
                ))}
            </Menu.Dropdown>
        </Menu>
    )
}
