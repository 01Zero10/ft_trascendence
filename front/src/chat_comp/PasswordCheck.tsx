import React, {useContext, useState} from "react"
import { Student } from "../App";
import { Center, PasswordInput } from "@mantine/core";

export default function PasswordCheck(props:any){
	const student = useContext(Student)
	const [inputPwd, setInputPwd] = useState("")
	const [error, setError] = useState(false)
	async function checkProtectedPassword() {
		const API_CHECK_PROTECTED_PASS = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/checkProtectedPass`;
		let response = await fetch(API_CHECK_PROTECTED_PASS, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ input: inputPwd, channelName: props.room.name })
		})
		const data = await response.json()
		if (data) {
			const API_SET_JOIN = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/setJoin`;
			await fetch(API_SET_JOIN, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ client: student.username, channelName: props.room.name, joined: props.joined }),
			})
			props.setJoined((prevJoin: boolean) => !prevJoin);
			props.socket?.emit('updateList', { type: props.room.type });
			setError(false)
		}
		else{
			setError(true)
		}
	}

	return(
		<div style={{color:"white", position:"relative"}}>
			<Center style={{flexDirection:"column"}}>
				<div>This Channel is Protected</div>
				<div>Insert Password to join</div>
				<PasswordInput error={error?"Wrong password":undefined} style={{width:"50%"}} value={inputPwd} autoComplete={"false"} onChange={(e) => setInputPwd(e.target.value)}></PasswordInput>
				<button style={{width:"30%", height:"30%"}} onClick={checkProtectedPassword}>Submit</button>
			</Center>
		</div>
	)
}