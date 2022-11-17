import React, { useState } from "react";
import "./Game.css"
import { LeadGrid } from "./game_comp/components/LeadGrid";
import PlayGround from "./game_comp/PlayGround";

export default function Game(props: any) {
    const [play, setPlay] = useState(false)

    return (
        <div className="game_container">
            <div className="fake_navbar">
            </div>
            {!play ? <LeadGrid setPlay={setPlay}></LeadGrid> :
            <div className="playground">
                <PlayGround socket={props.socket}></PlayGround>
            </div>}
        </div>
    )
}