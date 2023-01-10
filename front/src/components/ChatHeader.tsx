import { Modal } from "@mantine/core"
import React, { useState } from "react"

export default function ChatHeader(props: any) {
    const [open, setOpen] = useState(false)
    function chiudiGruppo(){
        props.setGruppo(false)
    }
    function indietro() {
        props.indietro("")
    }

    

    function creaGruppo(){
        props.setGruppo((prevGruppo: boolean) => !prevGruppo)
    }

    function changeGroupName(e: React.ChangeEvent<HTMLInputElement>){
        props.setGroupName(e.target.value);
    }

    return (
        <div id="user" className={props.status === "chiusa" ? "chiuso" : undefined}>
            {props.stanza && <span id="indietro" onClick={indietro}>{"<"}</span>}
            {props.stanza && <span style={{float: "left"}} onClick={() => setOpen((prevOpen) => !prevOpen)}>ciao</span>}
            {/*<img id="foto" src="foto.jpg">*/}
            {(props.main || props.gName) && <span id="nome">{!props.gName ? props.stanza : props.gName}</span>}
            {/* {!props.main && <input type="text" placeholder="Write the group name.." id="group-name" onChange={changeGroupName}></input>} */}
            <span id="chiudi" onClick={props.main ? props.close : chiudiGruppo}>+</span>
            {(!props.stanza && props.main && props.status !== "chiusa") && <span id="apri" onClick={creaGruppo}>+</span>}
            {/* <input type="text"></input> */}
            <Modal opened={open} onClose={() => setOpen((prevOpen) => !prevOpen)}/>
        </div>
    )
}