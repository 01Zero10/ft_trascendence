import React, { useContext, useEffect, useLayoutEffect, useState } from "react"
import { Student } from "../App";

export default function ChannelInput(props: any) {
    const student = useContext(Student)
    const [input, setInput] = useState('');

    const handleSend = () => {
		if (input !== '') {
			props.socket?.emit(
				'msgToServer',
				{ room: props.room.name, username: student.username, message: input, avatar: student.avatar }
			);
			setInput('');
		}
	};

    const setNewLine = (e: any) => {
        if (e.shiftKey && e.key === "Enter") {
            e.preventDefault()
            props.setInput((prevInput: string) =>
                (prevInput + "\n")
            )
        }
        else if (!e.shiftKey && e.key === "Enter") {
            e.preventDefault()
            handleSend();
        }
    }

    // function sendWithEnter(e: any) {

    //     }
    // }

    // useEffect(() => {
    //     document.addEventListener("keydown", setNewLine)
    //     document.addEventListener("keydown", sendWithEnter)
    //     return () => {
    //         document.removeEventListener("keydown", setNewLine)
    //         document.removeEventListener("keydown", sendWithEnter)
    //     }
    // }, [])

    //console.log("input room",props.room)

    return (
        <div className="channel-input">
            <textarea className="channel-input-text" 
                        value={input} 
                        placeholder={props.mute ? "sei stato mutato" : "Scrivi qui il tuo messaggio..." }
                        onChange={(e) => setInput(e.target.value)} 
                        required
                        disabled={props.mute}
                        onKeyDown={setNewLine}
                        >
            </textarea>
            <button className="channel-input-button" onClick={handleSend} disabled={props.mute}>Invia</button>
        </div>
    )
}