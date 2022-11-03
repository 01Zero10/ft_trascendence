import React from "react"

export default function Button(props: any){
	return (
		<button id={props.id} onClick={props.handleClick}>{props.text}</button>
	)
}