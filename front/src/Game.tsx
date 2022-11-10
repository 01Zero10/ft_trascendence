// import React from 'react';

// function Game() {
//     return (
//         <div>
//             Ping pong game
//         </div>
//     );
// }

// export default Game;

import React from "react";
import "./Game.css"
import GameMenu from "./game_comp/GameMenu";
import PlayGround from "./game_comp/PlayGround";



// class Paddle extends React.Component {
//     static propTypes = {
//        x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
//        y: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
//        onKeyDown: PropTypes.func,
//        tabIndex: PropTypes.string
//     };

//     static defaultProps = {
//        onKeyDown: Function.prototype,
//        tabIndex: ""
//     };

// function Paddle(props: any) {
//     return (
//         <div
//             role="button"
//             //onKeyDown={this.props.onKeyDown}
//             className="Paddle"
//             //tabIndex={this.props.tabIndex}
//             style={{
//                 width: "15px",
//                 height: "150px",
//                 position: "absolute",
//                 backgroundColor: "#ffffff",
//                 opacity: "0.7",
//                 top: `${props.y}px`,
//                 left: `${props.x}px`
//             }}
//         >
//             <input type="text" className="paddleInput" />
//         </div>
//     );

// }

export default function Game(props: any) {

    return (
        <div className="game_container">
            <div className="fake_navbar">
                {/* Fake nav_bar */}
                {/*
                <div className="game-board">
                <GameMenu></GameMenu> 
            */}
            </div>
            <div className="playground">
                <PlayGround socket={props.socket}></PlayGround>
            </div>
        </div>
    )
}