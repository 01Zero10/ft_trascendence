import React from "react"

export default function SceltaUser(props: any) {
    let [cazz1, setCazz1] = React.useState(false)

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
                type="checkbox"
                id={props.name}
                value={props.name}
                onChange={ciao}
                checked={cazz1}
                className="user-list"
            />
            {/* <input
                type="radio"
                id={props.name + "off"}
                value={props.name}
                name={(props.name + "off")}
                onChange={ciao}
                checked={cazz1 === (props.name + "off")}
                className={"user-list"}
            /> */}
            <label htmlFor={props.name}>
                <div className="nome-stanza">{props.name}</div>
            </label>
        </div>
    )
}