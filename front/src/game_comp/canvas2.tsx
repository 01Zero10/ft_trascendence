import { useEffect, useLayoutEffect, useRef, useState } from "react";
import React from "react";
import Score from "./Score";
import { Socket } from "socket.io-client";
import Loader from "../components/Loader"
import { Paddle } from "./PlayGround";
// import type Point from "./PlayGround"
// import Ball from "./Ball";

type CanvasProps = {
  socket: Socket;
  clientPaddle: Paddle;
  opponentPaddle: Paddle;
  dir_y: -3 | 3;
  point: any;
  canvasWidth: number;
  canvasHeight: number;
  setPoint: React.Dispatch<React.SetStateAction<any>>
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
  //start: boolean
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

  let ball: Ball = { ...defaultBall }

  const drawPlayer = (context: CanvasRenderingContext2D, player: Player) => {
    context.beginPath()
    context.fillRect(player.x, player.y, player.width, player.height)
    context.closePath()
  }

  function startGame(ball: Ball, left: Player, right: Player) {
    drawPlayer(context!, left);
    drawPlayer(context!, right);
    drawBall(context!, ball);
  }

  function restart() {
    rightPlayer.y = (props.canvasHeight / 2) - (defaultPlayer.height / 2)
    rightPlayer.x = props.canvasWidth - (defaultPlayer.width)
    leftPlayer.y = (props.canvasHeight / 2) - (defaultPlayer.height / 2)
    leftPlayer.x = defaultPlayer.x
    ball = { ...defaultBall }
    //TODO: modifiocare angolo verso e angolo a seconda di chi fa gol
    startBall()
  }

  const drawBall = (context: CanvasRenderingContext2D, ball: Ball) => {
    context.beginPath()
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    context.closePath()
    //   if ((ball.y + ball.radius) + ball.dy > props.canvasHeight || (ball.y - ball.radius) + ball.dy < 0) {
    //     ball.dy = -ball.dy
    //   }
    //   if (ball.x + ball.dx < ball.radius) {
    //     if (ball.y > leftPlayer.y + leftPlayer.width && ball.y < (leftPlayer.y + leftPlayer.height) + leftPlayer.width)
    //       ball.dx = -ball.dx
    //     else {
    //       ball.dx = 0
    //       ball.dy = 0
    //       props.socket.emit("gol_right", { name: props.clientPaddle.playRoom })
    //       // startBall()
    //     }
    //   }
    //   if (ball.x + ball.dy > props.canvasWidth - ball.radius) {
    //     if (ball.y > rightPlayer.y + rightPlayer.width && ball.y < (rightPlayer.y + rightPlayer.height) + rightPlayer.width)
    //       ball.dx = -ball.dx
    //     else {
    //       ball.dx = 0
    //       ball.dy = 0
    //       props.socket.emit("gol_left", { name: props.clientPaddle.playRoom })
    //       // startBall()
    //     }
    //   }
    //   ball.x += ball.dx
    //   ball.y += ball.dy
  }

  function endGame() {
    props.socket.emit("punti", leftPlayer, rightPlayer, props.point.left, props.point.right)
  }

  // draw
  const draw = (context: CanvasRenderingContext2D | null) => {
    if (context) {
      context.clearRect(0, 0, props.canvasWidth, props.canvasHeight)
      drawPlayer(context, leftPlayer)
      drawPlayer(context, rightPlayer)
      drawBall(context, ball);
      context.fill()
      if (moveKey.s)
        handlePlayerMove(leftPlayer, 5)
      if (moveKey.w)
        handlePlayerMove(leftPlayer, -5)
      if (moveKey.ArrowDown)
        handlePlayerMove(rightPlayer, 5)
      if (moveKey.ArrowUp)
        handlePlayerMove(rightPlayer, -5)
    }
  }

  async function sleep(time: number) {
    await new Promise(f => setTimeout(f, time * 1000));
  }

  async function startBall() {
    //let dir_y: Array<number> = [-3, 3]
    await sleep(3)
    if (ball.direction === "r") {
      ball.dx += 3
      ball.dy += props.dir_y//dir_y[Math.round(Math.random())]
    }
    else {
      ball.dx -= 3
      ball.dy += props.dir_y//dir_y[Math.round(Math.random())]
    }
  }

  // useEffect(() => {
  //   if (canvasRef.current)
  //     context = canvasRef.current.getContext("2d");
  //   startBall().then()
  //   setInterval(() => {
  //     //console.log(ball.x)
  //     draw(context)
  //   }, 10)
  // }, [loader]
  // )

  const handlePlayerMove = (player: Player, direction: number) => {
    player.y = direction > 0 ? Math.min(player.y + direction, props.canvasHeight - player.height) :
      Math.max(player.y + direction, 0)
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (moveKey.hasOwnProperty(e.key))
      props.socket.emit('onPress', { key: e.key, side: props.clientPaddle.side, playRoom: props.clientPaddle.playRoom });
  }

  const handleKeyRelease = (e: KeyboardEvent) => {
    if (moveKey.hasOwnProperty(e.key))
      props.socket.emit('onRelease', { key: e.key, side: props.clientPaddle.side, playRoom: props.clientPaddle.playRoom });
  }

  useEffect(() => {
    props.socket.on("restart", (left: boolean) => {
      if (left) {
        props.setPoint((prevState: any) => { return { ...prevState, left: prevState.left + 1 } })
      }
      else {
        props.setPoint((prevState: any) => { return { ...prevState, right: prevState.right + 1 } })
      }
      restart()
    })
    props.socket.once('ready', (namePlayRoom: string) => {
      console.log("ricevuto ready ");
      setLoader(false);
      props.socket.emit('setStart', { namePlayRoom: namePlayRoom });
    })
    props.socket.once('start', (ball: Ball, leftPlayer: Player, rightPlayer: Player) => {
      if (canvasRef.current)
        context = canvasRef.current.getContext("2d");
      // console.log('loader = ', loader);
      // console.log('ball = ', ball);
      // console.log('left = ', leftPlayer);
      // console.log('right = ', rightPlayer);
      startGame(ball, leftPlayer, rightPlayer);
    })
    props.socket.on('onPress', (key: string, side: string) => {
      const up: 'ArrowUp' | 'w' = (side === 'left') ? 'w' : 'ArrowUp';
      const down: 'ArrowDown' | 's' = (side === 'left') ? 's' : 'ArrowDown';
      if (key === 'ArrowUp' || key === 'w')
        moveKey[up] = true;
      else
        moveKey[down] = true;
      //moveKey[key as 'ArrowUp' | 'ArrowDown' | 's' | 'w'] = true
    })
    props.socket.on('onRelease', (key: string, side: string) => {
      const up: 'ArrowUp' | 'w' = (side === 'left') ? 'w' : 'ArrowUp';
      const down: 'ArrowDown' | 's' = (side === 'left') ? 's' : 'ArrowDown';
      if (key === 'ArrowUp' || key === 'w')
        moveKey[up] = false;
      else
        moveKey[down] = false;
      //moveKey[key as 'ArrowUp' | 'ArrowDown' | 's' | 'w'] = false
    })
  }, [props.socket])


  // add event listener on canvas for mouse position

  useLayoutEffect(() => {
    document.addEventListener("keydown", handleKeyPress)
    document.addEventListener("keyup", handleKeyRelease)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
      document.removeEventListener("keyup", handleKeyRelease)
    }
  }, [context])

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
          {/* <Score position={"left"} player={"player1"} total={props.point.left}></Score>
        <Score position={"right"} player={"player2"} total={props.point.right}></Score> */}
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
