import { useEffect, useLayoutEffect, useRef, useState } from "react";
import React from "react";
import { Socket } from "socket.io-client";
import Loader from "../components/Loader"
import { Paddle } from "./PlayGround";

type CanvasProps = {
  socket: Socket;
  clientPaddle: Paddle;
  opponentPaddle: Paddle;
  dir_y: -3 | 3;
  point: any;
  canvasWidth: number;
  canvasHeight: number;
  setPoint: React.Dispatch<React.SetStateAction<any>>
  setOpponentSide: React.Dispatch<React.SetStateAction<Paddle>>
  ballDirection: string | null
  setLastpoint: React.Dispatch<React.SetStateAction<any>>
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
  radius: number
  dx: number
  dy: number
  direction: string | null
}

export default function Canvas(props: CanvasProps) {
  const defaultPlayer = { x: 0, y: 0, height: 70, width: 20 }
  const defaultBall = { x: props.canvasWidth / 2, y: props.canvasHeight / 2, radius: 20, dx: 0, dy: 0, direction: props.ballDirection }
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let context: CanvasRenderingContext2D | null = null;
  const [loader, setLoader] = useState<boolean>(true);
  let moveKey: MoveKey = { s: false, w: false, ArrowUp: false, ArrowDown: false }

  const rightPlayer = {
    ...defaultPlayer,
    y: (props.canvasHeight / 2) - (defaultPlayer.height / 2),
    x: props.canvasWidth - (defaultPlayer.width)
  }

  const leftPlayer = {
    ...defaultPlayer,
    y: (props.canvasHeight / 2) - (defaultPlayer.height / 2),
    x: defaultPlayer.x
  }
  
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
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    context.closePath()
  }

  // draw
  const draw = (context: CanvasRenderingContext2D | null, ball: Ball, leftPlayer: Player, rightPlayer: Player) => {
    if (context) {
      context.clearRect(0, 0, props.canvasWidth, props.canvasHeight)
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
      props.socket.emit('onPress', { key: e.key, side: props.clientPaddle.side, playRoom: props.clientPaddle.playRoom });
    }
  }

  function handleKeyRelease(e: KeyboardEvent) {
    if (moveKey.hasOwnProperty(e.key)) {
      e.preventDefault()
      props.socket.emit('onRelease', { key: e.key, side: props.clientPaddle.side, playRoom: props.clientPaddle.playRoom });
    }
  }

  useEffect(() => {
    props.socket.on('goal', async (data: { namePlayRoom: string, rightPlayer: string, leftPlayer: string }, point: number) => {
      console.log('reeeestart0', data);
      if (point === 1)
        props.setPoint((prevState: any) => {return {...prevState, right: ++prevState.right}})
      else
        props.setPoint((prevState: any) => {return {...prevState, left: ++prevState.left}})
      await sleep(3);
      if (props.clientPaddle.name === data.rightPlayer) {
        props.socket.emit('restart', data);
      }
    })
  }, [])

  useEffect(() => {
    props.socket.on('update', (ball: Ball, leftPlayer: Player, rightPlayer: Player) => {
      update(context!, ball, leftPlayer, rightPlayer);
    })
    props.socket.once('ready', (namePlayRoom: string, leftClient: string, rightClient: string) => {
      if (props.clientPaddle.side === 'right')
        props.setOpponentSide({name:leftClient, side: "left", playRoom: namePlayRoom })
      else
        props.setOpponentSide({name:rightClient, side: "right", playRoom: namePlayRoom })
      console.log("ricevuto ready ", leftClient, rightClient);
      setLoader(false);
      if (props.clientPaddle.side === 'right')
        props.socket.emit('setStart', {
          namePlayRoom: namePlayRoom,
          rightPlayer: rightClient,
          leftPlayer: leftClient
        });
    })
    props.socket.once('start', (ball: Ball, leftPlayer: Player, rightPlayer: Player) => {
      if (canvasRef.current)
        context = canvasRef.current.getContext("2d");
      startGame(ball, leftPlayer, rightPlayer);
      }
    )
  }, [props.socket, props.clientPaddle])


  // add event listener on canvas for mouse position

  useLayoutEffect(() => {
    document.addEventListener("keydown", handleKeyPress)
    document.addEventListener("keyup", handleKeyRelease)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
      document.removeEventListener("keyup", handleKeyRelease)
    }
  }, [props.clientPaddle]) // !!! levato context e messo clientPaddle

  return (
    <div>
      {loader ? <Loader /> :
        <div>
          <h2 style={{ color: "black" }}>Player L 
            {props.clientPaddle.side === 'left' ? props.clientPaddle.name : props.opponentPaddle.name}</h2>
          <div style={{ color: "black" }} className={"player1"}>
            <h2 style={{ color: "black" }}>{props.point.left}</h2>
          </div>
          <h2 style={{ color: "black" }}>Player R 
            {props.clientPaddle.side === 'right' ? props.clientPaddle.name : props.opponentPaddle.name}</h2>
          <div style={{ color: "black" }} className={"player2"}>
            <h2 style={{ color: "black" }}>{props.point.right}</h2>
          </div>
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
      }
    </div>
  );
}
