import {useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import React from "react";
import { Socket } from "socket.io-client";
import Loader from "../components/Loader"
import { Paddle } from "./PlayGround";
import {Student} from "../App";

type CanvasProps = {
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let context: CanvasRenderingContext2D | null = null;
  const [loader, setLoader] = useState<boolean>(true);
  let moveKey: MoveKey = { s: false, w: false, ArrowUp: false, ArrowDown: false }
  
  function startGame(ball: Ball, left: Player, right: Player) {
    console.log("ball\n", ball, "\nleft\n", left, "\nright\n", right)
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
      context.fillRect(props.canvasWidth / 2 - 2, 0, 4, props.canvasHeight )
      context.fillRect(0, 0, props.canvasWidth, 4 )
      context.fillRect(0, props.canvasHeight -4, props.canvasWidth, 4)
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

  useEffect(() => {
    props.socket.on('goal', async (data: {roomName: string, leftPoint: number, rightPoint: number }) => {
      console.log('reeeestart0', data);
      props.setPoint({left:data.leftPoint, right: data.rightPoint})
      //TODO: impostare conto alla rovescia
      await sleep(3);
      // if (props.clientPaddle.name === data.rightPlayer) {
      //   props.socket.emit('restart', data);
      // }
    })
  }, [])

  useEffect(() => {
    props.socket.on('update', (ball: Ball, leftPlayer: Player, rightPlayer: Player) => {
      update(context!, ball, leftPlayer, rightPlayer);
    })
    props.socket.once('ready', (data: {namePlayRoom: string, leftClient: string, rightClient: string}) => {
      props.setGameData({
        roomName: data.namePlayRoom,
        leftPlayer: data.leftClient,
        rightPlayer: data.rightClient
      })
      setLoader(false);
      console.log("test", student.username === props.gameData.rightPlayer, "\nstudent", student.username, "\ngameDATA", props.gameData.rightPlayer)
      if (student.username === data.rightClient)
        props.socket.emit('setStart', data.namePlayRoom);
    })
    props.socket.once('start', (ball: Ball, leftPlayer: Player, rightPlayer: Player) => {
      if (canvasRef.current)
        context = canvasRef.current.getContext("2d");
      startGame(ball, leftPlayer, rightPlayer);
      }
    )
  }, [props.socket, props.gameData])

  useLayoutEffect(() => {
    document.addEventListener("keydown", handleKeyPress)
    document.addEventListener("keyup", handleKeyRelease)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
      document.removeEventListener("keyup", handleKeyRelease)
    }
  }, []) // !!! levato context e messo clientPaddle

  return (
    <div>
      {loader ? <Loader /> :
        <div style={{width:"100%", height:"100%", position:"relative"}}>
          <div style={{position:"relative", display:"flex", width:"10%", height:"100%"}}>
            <h2 style={{ color: "#ffffff" }}>Player L
              {props.gameData.leftPlayer}</h2>
            <div style={{ color: "#ffffff" }} className={"player1"}>
              <h2 style={{ color: "#ffffff" }}>{props.point.left}</h2>
            </div>
            <h2 style={{ color: "#ffffff"}}>Player R
              {props.gameData.rightPlayer}</h2>
            <div style={{ color: "#ffffff"}} className={"player2"}>
              <h2 style={{ color: "#ffffff" }}>{props.point.right}</h2>
            </div>
          </div>
          <div style={{width: "90%"}}>
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
            ></canvas>
          </div>
        </div>
      }
    </div>
  );
}
