import React from "react"
import SearchProps from "./SearchProps";

export default function Textbox(props: SearchProps){
	return (
		<input type={props.type}
                    autoComplete={props.autoComplete}
                    placeholder={props.placeholder}
                    id={props.id}
					className={props.class}
					value={props.value}
                    onChange={props.handleChange}
					></input>
	)
}