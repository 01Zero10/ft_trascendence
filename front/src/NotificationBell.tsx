import { ActionIcon, Indicator, Menu } from '@mantine/core'
import { IconBell } from '@tabler/icons'
import { stringify } from 'querystring'
import React, { useState } from 'react'
import "./NotificationBell.css"

export default function NotificationBell(props: any) {

  return (
    <Menu shadow="md" width={350} position="bottom-start">
        <Menu.Target>
            <ActionIcon variant="transparent">
                {/* showZero e dot sono false quando il count = 0; */}
                {}
                <Indicator label={String(props.count)} inline size={16} color={"red"} showZero={false} dot={false} processing>
                    <IconBell color='white' className={props.count !== 0 ? 'bell' : "" }></IconBell>
                </Indicator>
            </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
            <Menu.Label>Notifications menu</Menu.Label>
                <Menu.Divider />
                    <Menu.Item>• New message from Pippo!</Menu.Item>
                    <Menu.Item>• Friend request from Scooby-Doo!</Menu.Item>
                    <Menu.Item>• Aldo challenged you to play!</Menu.Item>
                    <Menu.Item>• You've been kicked from "1234"</Menu.Item>
      </Menu.Dropdown>
  </Menu>
  )
}
