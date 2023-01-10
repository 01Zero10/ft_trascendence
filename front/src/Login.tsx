import { TextField } from '@mui/material';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import './Login.css';



function Login() {

	  async function updateChannelUsersList() {
		const API_URL_UPDATE_CHANNEL_USERS_LIST = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/updateChannelUsersList`;
		await fetch(API_URL_UPDATE_CHANNEL_USERS_LIST, {
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		})
	}

	useLayoutEffect(() => {
		updateChannelUsersList();
	}, [])

	function login42() {
		window.location.href = `${process.env.REACT_APP_REDIRECT_URI}`
	}
	return (
		<div className='box'>
			<h1 className='welcome'>Welcome!</h1>
			<button className='button_login' onClick={login42} type="button">Sign In</button>
			<div className='_prv_'></div>
		</div>
		// <div className="login-box">
		// 	 <h2>Choose your avatar</h2>
		//  <img src="admin.svg"  alt='img'/>  
		// <form>
		// 		<h2 className='nickname'>Choose your nickname</h2>
		// 	 <input type="text" placeholder="Nickname" /> 
		// 	 <TextField id="standard-basic" label="Nickname" variant="standard" /> 
		// 	<button onClick={login42} type="button">Sign In</button>			
		// </form>
		// <br />
		// 	 <div className='checkbox'>
		// 		<input className='box-check' type="checkbox" id="check" name="check" />
		// 		<label htmlFor='check'>Activate two factor via Email</label>
		// 	</div> 
		// </div>
	);
}

export default Login;