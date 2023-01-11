import { IconButton, TextField } from "@mui/material";
import { IconArrowBack, IconDoor } from "@tabler/icons";
import SendIcon from '@mui/icons-material/Send';
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Student } from "./App";
import './TwoFactorLogin.css'

export default function TwoFactorLogin(props: any) {

	const student = useContext(Student)
	const [pin, setPin] = useState<number>();

	const handleKeyDown = (e: any) => {
		if (e.key === "-" || e.key === "e" || e.key === "," || e.key === "+" || e.key === ".") {
		  e.preventDefault();
		}
	  };

	let navigate = useNavigate(); 
	const routeChange = async (e: React.MouseEvent) =>{
		e.preventDefault()

		await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/isFAValid`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ pin: `${pin}`, id: `${student.id}` }),
		  }).then(async (response) => await response.json())
			.then(data => student.tfa_checked = (data.ret));
		if (student.tfa_checked){
			props.setcontextData((prevCtx: any) => {return {...prevCtx, tfa_checked: true}})
			let path = `/home`; 
			navigate(path);
		}
	}

	const pinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPin(e.target.valueAsNumber)
	  }
	return (
		<>
			<div className="twoFactorAuth_container">
				<p className="twoFactorAuthText">2-Factor Auth</p>
				<input className="twoFactorAuth_input" type="number" onKeyDown={handleKeyDown} onChange={pinInput} value={pin} autoFocus placeholder="OTP password"/>
				<button className="twoFactorAuth_backHomeButton" onClick={event => { routeChange(event) }}>
					<div className="twoFactorAuth_backHomeButton_content">
						CONFIRM
					</div>
				</button>
			</div>
			<div className='_prv_'></div>
		</>
	)
}