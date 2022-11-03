import React from "react"

export default function Message(props: any){
	return (
		<div className={props.class}>
			<span className="dettagli">{props.createdAt}</span>
			<span className="message-user">{props.username}</span>
			<span className="testo">{props.message}</span>
		</div>
	)
}