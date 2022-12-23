import React, { useContext } from "react"
import { Divider, SegmentedControl } from "@mantine/core";
import OwnerPanel from "./PasswordCheck";
import AdminPanel from "./AdminPanel";
import { Student } from "../App";

export default function OptionsPanel(props: any) {
	const student = useContext(Student)
	//TODO: il tipo di scheda deve arrivare da chat
	//se owner vede lo switch


	function changeOpened(value: string) {
		props.setOpened(value)
	}
	return (
		<>
			<Divider my="sm" />
			{(student.username === props.chOptions?.builder.username) && <SegmentedControl
				onChange={changeOpened}
				fullWidth
				color="grape"
				radius={"xl"}
				transitionDuration={350}
				defaultValue={props.type}
				data={[
					{ label: 'Owner panel', value: 'owner' },
					{ label: 'Admin panel', value: 'admin' }]}
			/>}
			{/*{props.opened === "owner" && <OwnerPanel chOptions={props.chOptions} setOpened={props.setOpened}/>}*/}
			{/* {props.opened === "admin" && <AdminPanel room={props.room}/>} */}
			{props.opened === "admin" && <AdminPanel room={props.chOptions ? props.chOptions : props.room} socket={props.socket} />}
		</>
	)
}