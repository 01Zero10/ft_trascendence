import React, { useContext, useEffect, useState } from "react"
import { Student } from "../App";

export default function ChannelInput(props: any) {
    const student = useContext(Student)
    const [input, setInput] = useState('');

    console.log("input room: ", props.room)

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
    }

    function sendWithEnter(e: any) {
        if (!e.shiftKey && e.key === "Enter") {
            e.preventDefault()
            handleSend();
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", setNewLine)
        document.addEventListener("keydown", sendWithEnter)
        return () => {
            document.removeEventListener("keydown", setNewLine)
            document.removeEventListener("keydown", sendWithEnter)
        }
    }, [props.input])

    //console.log("input room",props.room)

    return (
        <form className="channel-input">
            <textarea id="message-area"  className="channel-input-text" 
                        value={input} 
                        placeholder={props.mute ? "sei stato mutato" : "Scrivi qui il tuo messaggio..." }
                        onChange={(e) => setInput(e.target.value)} 
                        required
                        disabled={props.mute}
                        >
            </textarea>
            <button className="channel-input-button" onClick={handleSend} disabled={props.mute}>Invia</button>
        </form>
    )
}