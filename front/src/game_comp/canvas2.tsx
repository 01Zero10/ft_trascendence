import { useEffect,  useRef, } from "react";
import React from "react";
import { Socket } from "socket.io-client";


type CanvasProps = {
    socket: Socket;

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



type Ball = {
    x: number
    y: number
    width: number
    height: number
    dx: number
    dy: number
    direction: string | null
}

export default function Canvas2(props: CanvasProps) {
    const defaultPlayer = { x: 0, y: 0, height: 70, width: 20 }
    const defaultBall = { x: props.canvasWidth / 2 - 15, y: props.canvasHeight / 2 - 15, width: 30, height: 30, dx: 0, dy: 0, direction: props.ballDirection }
    const canvasRef = useRef<HTMLCanvasElement>(null);
    let context: CanvasRenderingContext2D | null = null;

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

    const ball = {...defaultBall}

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

    useEffect(() => {
        if (canvasRef.current)
            context = canvasRef.current.getContext("2d");
            startGame(ball, leftPlayer, rightPlayer);
    },[])


    return (
        <div>
                <div style={{width:"100%", height:"100%", position:"relative"}}>
                    <div style={{position:"relative", display:"flex", width:"10%", height:"100%"}}>
                        <h2 style={{ color: "#ffffff" }}>Player L
                            {"dbalducc"}</h2>
                        <div style={{ color: "#ffffff" }} className={"player1"}>
                            <h2 style={{ color: "#ffffff" }}>{props.point.left}</h2>
                        </div>
                        <h2 style={{ color: "#ffffff"}}>Player R
                            {"mobrychi"}</h2>
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
        </div>
    );
}