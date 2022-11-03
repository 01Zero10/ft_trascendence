import React, { useEffect } from "react"

export default function ChatInput(props: any) {

    const setNewLine = (e: any) => {
        if (e.shiftKey && e.key === "Enter"){
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
        document.addEventListener( "keydown", setNewLine)
        document.addEventListener("keydown", sendWithEnter)
        return () => {
            document.removeEventListener("keydown", setNewLine)
            document.removeEventListener("keydown", sendWithEnter)
        }
    }, [props.input])
    
    return (
        <div className={"scrittura" + (props.close === "chiusa" && "chiuso")}>
            <textarea id="text-box" value={props.input} placeholder="Scrivi qui il tuo messaggio..." onChange={(e) => props.setInput(e.target.value)} required></textarea>
            <button className="invio" onClick={props.handleSend}>Invia</button>
        </div>
    )
}