import {useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import React from "react";
import { Socket } from "socket.io-client";
import Loader from "../Loader"
import {Student} from "../App";
import { PongTitle } from "./components/PongTitle";
import "./Canvas.css"

type CanvasProps = {
  loader: boolean;
  socket: Socket;
  point: any;
  canvasWidth: number;
  canvasHeight: number;
  setPoint: React.Dispatch<React.SetStateAction<any>>;
  gameData: {roomName: string, leftPlayer: string, rightPlayer: string};
  setGameData:  React.Dispatch<React.SetStateAction<{roomName: string, leftPlayer: string, rightPlayer: string}>>;
};

type Player = {
  x: number
  y: number
  height: number
  width: number
}

type MoveKey = {
  s: boolean
  w: boolean
  ArrowUp: boolean
  ArrowDown: boolean
}

type Ball = {
  x: number
  y: number
  width: number
  height: number
  dx: number
  dy: number
  direction: string | null
}

export default function Canvas(props: CanvasProps) {
  const student = useContext(Student)
  const [avatar, setAvatar] = useState<{avatarL: string, avatarR: string}>({avatarL: "", avatarR: ""})
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let context: CanvasRenderingContext2D | null = null;

  let moveKey: MoveKey = { s: false, w: false, ArrowUp: false, ArrowDown: false }
  
  function startGame(ball: Ball, left: Player, right: Player) {
    update(context, ball, left, right)
  }

  function update(context: CanvasRenderingContext2D | null, ball: Ball, left: Player, right: Player) {
    if (context)
      draw(context, ball, left, right);
  }
  
  const drawPlayer = (context: CanvasRenderingContext2D, player: Player) => {
    context.beginPath()
    context.fillRect(player.x, player.y, player.width, player.height)
    context.closePath()
  }

  const drawBall = (context: CanvasRenderingContext2D, ball: Ball) => {
    context.beginPath()
    context.fillRect(ball.x, ball.y, ball.width, ball.height )
    context.closePath()
  }

  // draw
  const draw = (context: CanvasRenderingContext2D | null, ball: Ball, leftPlayer: Player, rightPlayer: Player) => {
    if (context) {
      context.fillStyle = "#781C9C"
      context.clearRect(0, 0, props.canvasWidth, props.canvasHeight)
      context.beginPath()
      // context.fillRect(props.canvasWidth / 2 - 2, 0, 4, props.canvasHeight ) vecchia linea mediana
      context.fillRect(0, 0, props.canvasWidth, 4 )
      context.fillRect(0, props.canvasHeight -4, props.canvasWidth, 4)
      context.closePath()
      

      // Linea mediana tratteggiata
      context.strokeStyle = "#781C9C";
      context.beginPath()
      context.setLineDash([10,10])
      context.moveTo(props.canvasWidth /2, 0)
      context.lineTo(props.canvasWidth /2, props.canvasHeight)
      context.stroke()
      context.closePath()

      drawPlayer(context, leftPlayer)
      drawPlayer(context, rightPlayer)
      drawBall(context, ball);
      context.fill()
    }
  }

  async function sleep(time: number) {
    await new Promise(f => setTimeout(f, time * 1000));
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (moveKey.hasOwnProperty(e.key)) {
      e.preventDefault();
      props.socket.emit('onPress', { key: e.key, player: student.username, playRoom: props.gameData.roomName });
    }
  }

  function handleKeyRelease(e: KeyboardEvent) {
    if (moveKey.hasOwnProperty(e.key)) {
      e.preventDefault()
      props.socket.emit('onRelease', { key: e.key, player: student.username, playRoom: props.gameData.roomName})
  }}

  async function getAvatars() {
    if (props.gameData.roomName !== ""){
      let response = await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/game/getAvatars/${props.gameData.roomName}`);
      let data = await response.json();
      console.log("Avatar: ", data
      )
      if (data){
        setAvatar({avatarL: data.avatar1, avatarR:data.avatar2});
      }
  }
}

  useEffect(() => {
    props.socket.on('goal', async (data: {roomName: string, leftPoint: number, rightPoint: number }) => {
      props.setPoint({left:data.leftPoint, right: data.rightPoint})
      //TODO: impostare conto alla rovescia
      await sleep(3);
      if (props.gameData.rightPlayer === student.username) {
        props.socket.emit('restart', data.roomName);
      }
    })
  }, [props.gameData])

  useEffect(() => {
    if (props.gameData.rightPlayer !== student.username && props.gameData.leftPlayer !== student.username)
      props.socket.emit('makeMeSee', {namePlayRoom: props.gameData.roomName})
  }, [])

  useEffect(() => {
    getAvatars();
    props.socket.on('update', (ball: Ball, leftPlayer: Player, rightPlayer: Player) => {
      update(context!, ball, leftPlayer, rightPlayer);
    })
    props.socket.once('start', (ball: Ball, leftPlayer: Player, rightPlayer: Player) => {
      if (canvasRef.current)
        context = canvasRef.current.getContext("2d");
      startGame(ball, leftPlayer, rightPlayer);
      }
    )
  }, [props.socket, props.gameData])

  useEffect(() => {
    if(student.username === props.gameData.leftPlayer || student.username === props.gameData.rightPlayer){
      document.addEventListener("keydown", handleKeyPress)
      document.addEventListener("keyup", handleKeyRelease)
      return () => {
        document.removeEventListener("keydown", handleKeyPress)
        document.removeEventListener("keyup", handleKeyRelease)
      }
    }
  }, [props.gameData])

  return (
    <div style={{position:"relative", width:"100%"}}>
      {props.loader ? <Loader /> :
      <div className="canvasPongWindow">
        <div className="canvasPongPoints">
          <h2 className="playerLeftPoints">{props.point.left}</h2>
          <h2 className="playerRightPoints">{props.point.right}</h2>
        </div>
        <div className={"canvasPongContainer"}>
          <div className="playerAvatarName">
              <img className="playerAvatarDimension" src={avatar.avatarL} loading="lazy" />
              <h2>{props.gameData.leftPlayer}</h2>
          </div>
          <div className="canvasDraw">
              <canvas
                  ref={canvasRef}
                  width={props.canvasWidth}
                  height={props.canvasHeight}
                  style={{
                      border: "2px solid #000",
                      width: `${props.canvasWidth}px`,
                      height: `${props.canvasHeight}px`,
                      margin: "20px"
                  }}
              />
          </div>
          <div className="playerAvatarName">
              <img className="playerAvatarDimension" src={avatar.avatarR} loading="lazy" />
              <h2>{props.gameData.rightPlayer}</h2>
          </div>
        </div>
      </div>}
  </div>
    // <div>
    //   {props.loader ? <Loader /> :
    //     <div style={{width:"100%", height:"100%", position:"relative"}}>
    //       <div style={{position:"relative", display:"flex", width:"10%", height:"100%"}}>
    //         <h2 style={{ color: "#ffffff" }}>Player L
    //           {props.gameData.leftPlayer}</h2>
    //           <img src={avatar.avatarL} alt={props.gameData.leftPlayer} />
    //         <div style={{ color: "#ffffff" }} className={"player1"}>
    //           <h2 style={{ color: "#ffffff" }}>{props.point.left}</h2>
    //         </div>
    //         <h2 style={{ color: "#ffffff"}}>Player R
    //           {props.gameData.rightPlayer}</h2>
    //           <img src={avatar.avatarR} alt={props.gameData.rightPlayer} />
    //         <div style={{ color: "#ffffff"}} className={"player2"}>
    //           <h2 style={{ color: "#ffffff" }}>{props.point.right}</h2>
    //         </div>
    //       </div>
    //       <div style={{width: "90%"}}>
    //         <canvas
    //           ref={canvasRef}
    //           width={props.canvasWidth}
    //           height={props.canvasHeight}
    //           style={{
    //             border: "2px solid #000",
    //             width: `${props.canvasWidth}px`,
    //             height: `${props.canvasHeight}px`,
    //             margin: "20px"
    //           }}
    //         ></canvas>
    //       </div>
    //     </div>
    //   }
    // </div>
  );
}
