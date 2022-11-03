import React, { useEffect } from "react"

export default function ChannelInput(props: any) {

    const setNewLine = (e: any) => {
        if (e.shiftKey && e.key === "Enter") {
            e.preventDefault()
            props.setInput((prevInput: string) =>
                (prevInput + "\n")
            )
        }
    }

    function sendWithEnter(e: any) {
    	//console.log(e)
        if (!e.shiftKey && e.key === "Enter") {
            e.preventDefault()
            props.handleSend();
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

    return (
        <div className="channel-input">
            <textarea   className="channel-input-text" 
                        value={props.input} 
                        placeholder={props.mute ? "sei stato mutato" : "Scrivi qui il tuo messaggio..." }
                        onChange={(e) => props.setInput(e.target.value)} 
                        required
                        disabled={props.mute}
                        >
            </textarea>
            <button className="channel-input-button" onClick={props.handleSend} disabled={props.mute}>Invia</button>
        </div>
    )
}