import { CheckBox } from "@mui/icons-material";
import React, {useId}from "react"

export default function SceltaStanza(props: any) {
    let [cazz1, setCazz1] = React.useState(false)
	let id = useId()


    //let arr: string[] = [];
    function scelta() {
        props.setStanza(props.name)
    }

    function ciao(e: React.ChangeEvent<HTMLInputElement>) {
        if (!props.groupMembers.find((x: string) => x === e.target.value)){
            props.setGroupMembers((prevGroupMembers: string[]) => [...prevGroupMembers, e.target.value]);
            setCazz1(true)
        }
        else {
            if(props.groupMembers.indexOf(e.target.value) !== -1){
                let arr = [...props.groupMembers]
                arr.splice(props.groupMembers.indexOf(e.target.value), 1)
                props.setGroupMembers(arr)
                setCazz1(false)
            }
        }
    }
	
    return (
        <div>
            <input
                type={props.main ? "radio" : "checkbox"}
                id={id}
                value={props.name}
                name={!props.main ? props.name : "stanza"}
                onChange={props.main ? scelta : ciao}
                checked={props.main ? false : cazz1}
                className={!props.main ? "user-list" : ""}
            />
            <label htmlFor={id}>
                <div className="nome-stanza">{props.name}</div>
            </label>
        </div>
    )
}