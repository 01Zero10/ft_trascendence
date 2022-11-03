import { useLayoutEffect, useRef } from "react";
import React from "react";

type CanvasProps = {
  canvasWidth: number;
  canvasHeight: number;
  setPoint:  React.Dispatch<React.SetStateAction<any>>
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
  const defaultBall = {x:props.canvasWidth / 2, y: props.canvasHeight / 2, radius: 15, dx: 0, dy: 0, direction: props.ballDirection }
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let context: CanvasRenderingContext2D | null = null;


  let moveKey: MoveKey = { s: false, w: false, ArrowUp: false, ArrowDown: false }

  const rightPlayer = {
    ...defaultPlayer,
    x: props.canvasWidth - (defaultPlayer.width + defaultPlayer.width / 2)
  }

  const leftPlayer = {
    ...defaultPlayer,
    x: defaultPlayer.x + defaultPlayer.width / 2
  }

  const ball: Ball = {...defaultBall}

  const drawPlayer = (context: CanvasRenderingContext2D, player: Player) => {
    context.beginPath()
    context.fillRect(player.x, player.y, player.width, player.height)
    context.closePath()
  }

  const drawBall = (context: CanvasRenderingContext2D) => {
    context.beginPath()
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    context.closePath()
    if ((ball.y + ball.radius) + ball.dy > props.canvasHeight || (ball.y + ball.radius) + ball.dy < 0) {
      ball.dy = -ball.dy;
    }
    ball.x += ball.dx
    ball.y += ball.dy
  }

  // draw
  const draw = (context: CanvasRenderingContext2D | null) => {
    if (context) {
      context.clearRect(0, 0, props.canvasWidth, props.canvasHeight)
      drawPlayer(context, leftPlayer)
      drawPlayer(context, rightPlayer)
      drawBall(context)
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
    let dir_y: Array<number> = [-2, 2]
    await sleep(3)
    if (ball.direction === "r")
    {
      ball.dx += 1
      ball.dy += dir_y[Math.round(Math.random())]
    }
    else
    {
      ball.dx -= 1
      ball.dy += dir_y[Math.round(Math.random())]
    }
  }

  useLayoutEffect(() => {
    if (canvasRef.current)
      context = canvasRef.current.getContext("2d");
    startBall().then()
    setInterval(() => {
      draw(context)
    }, 10)
  }, []
  )

  const handlePlayerMove = (player: Player, direction: number) => {
    player.y = direction > 0 ? Math.min(player.y + direction, props.canvasHeight - player.height) :
      Math.max(player.y + direction, 0)
  }

  useLayoutEffect(() => {
    if (moveKey.s)
      handlePlayerMove(leftPlayer, 5)
    if (moveKey.w)
      handlePlayerMove(leftPlayer, -5)
    if (moveKey.ArrowDown)
      handlePlayerMove(rightPlayer, 5)
    if (moveKey.ArrowUp)
      handlePlayerMove(rightPlayer, -5)
  },)


  const handleKeyPress = (e: KeyboardEvent) => {
    if (moveKey.hasOwnProperty(e.key))
      moveKey[e.key as 'ArrowUp' | 'ArrowDown' | 's' | 'w'] = true
  }

  const handleKeyRelease = (e: KeyboardEvent) => {
    if (moveKey.hasOwnProperty(e.key))
      moveKey[e.key as 'ArrowUp' | 'ArrowDown' | 's' | 'w'] = false
  }


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
  );
}
