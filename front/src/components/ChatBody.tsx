import SceltaStanza from "./SceltaStanza"
import { useState, useRef, useEffect, useId } from "react"
import SceltaUser from "./SceltaUser";
import Message from "./Message";
import { type } from "@testing-library/user-event/dist/type";
import { Modal, Button, Group } from '@mantine/core';


export default function ChatBody(props: any) {
    let [user, setUser] = useState("")
    let [userAvavtar, setUserAvatar] = useState("")
    const bottomRef = useRef<null | HTMLDivElement>(null);
    const id = useId()
    const key = useId()

    useEffect(() => {
        bottomRef.current?.scrollIntoView()
    }, [props.arrMessaggi])

    if ((props.stanza && props.main)) {

        return (
            <div id="conversazione" className={"conversazione" +
                (props.closed === "chiusa" ? " chiuso" : "")}>
                {/* <img src={pika} className=""/>  */}

                {
                    props.arrMessaggi.map(
                        (m: any) => {
                            // setUser((prevUsername) => m.username !== prevUsername ? m.username : prevUsername)
                            return (<>
                                <img src={m.avatar} className={props.user !== m.username ? "body-photo-right" : "body-photo-left"} />
                                <Message class={props.user !== m.username ? "messaggio assistente" : "messaggio utente"} username={m.username} createdAt={m.createdAt} message={m.message} />
                            </>)
                        }
                    )
                }
                <div ref={bottomRef}></div>
            </div>
        )
    }
    else {
        return (
            <div id="list">
                {props.arr.map(function (item: string, id: number): any {
                    if (item.includes(props.src)) {
                        return (
                            <SceltaStanza
                                key={id} name={item} main={props.main}
                                setStanza={props.setStanza}
                                groupMembers={props.groupMembers}
                                setGroupMembers={props.setGroupMembers}
                                setGruppo={props.setGruppo} />
                        )
                    }
                })}
            </div>
        )
    }
}