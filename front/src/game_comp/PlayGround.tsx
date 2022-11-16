import { positions } from "@mui/system"
import { useContext, useEffect, useLayoutEffect, useState } from "react"
import { Student } from "../App"
import Loader from "../components/Loader"
import Canvas from "./canvas2"
import Score from "./Score"

type Ball = {
    x: number
    y: number
    radius: number
    dx: number
    dy: number
    //start: boolean
    direction: string | null
}

type Player = {
    x: number
    y: number
    height: number
    width: number
}

type Point = {
    left: number
    right: number
}

export type Paddle = {
    name: string,
    side: string,
    playRoom: string,
}

function PlayGround(props: any) {
    const contextData = useContext(Student)
    // const [loader, setLoader] = useState<boolean>(true);
    const [clientSide, setClientSide] = useState<Paddle>({ name: contextData.username, side: '', playRoom: '' });
    const [opponentSide, setOpponentSide] = useState<Paddle>({ name: '', side: '', playRoom: '' });
    const [point, setPoint] = useState<Point>({
        left: 0,
        right: 0
    })
    //const dir: Array<string> = ["l", "r"]
    const [lastPoint, setLastPoint] = useState<"l" | "r" | null>(null)
    //const [ballDirection, setBallDirection] = useState<"l" | "r" >(dir[Math.round(Math.random())] as "l" | "r")
    const [ballDirection, setBallDirection] = useState<"l" | "r" | null>(null)
    const [dir_y, setDir_y] = useState<-3 | 3 | null>(null);

    useEffect(() => {
        if (clientSide.side === '') {
            //console.log("stampa npme")
            props.socket.emit('connectToGame', { username: contextData.username, avatar: contextData.avatar });
        }
    }, [])


    useEffect(() => {
        props.socket.once('connectedToGame', (namePlayRoom: string, side: string) => {
            //console.log("once ", side, namePlayRoom)
            setClientSide((prevState) => { return ({ ...prevState, side: side, playRoom: namePlayRoom }) })
            //console.log("SIDE ", side);
            if (side === 'right')
                props.socket.emit('requestOpponent', { namePlayRoom: namePlayRoom, side: side })
            //props.socket.emit('joinPlayRoom', { namePlayRoom: namePlayRoom, side: side });
        })
    }, [props.socket])

    useLayoutEffect(() => {
        if (lastPoint) {
            setBallDirection((prevState) => {
                if (prevState === "l")
                    return "r"
                return "l"
            })
        }
    }, [lastPoint])

    return (
        <div>
            {/* <div>
                <Score position={"left"} player={"player1"} total={point.left}></Score>
                <Score position={"right"} player={"player2"} total={point.right}></Score>
            </div> */}
            {/* {loader ? <Loader /> : */}
            <>
                <Canvas
                    socket={props.socket}
                    clientPaddle={clientSide}
                    opponentPaddle={opponentSide}
                    dir_y={dir_y as 3 | -3}
                    point={point}
                    canvasHeight={750}
                    canvasWidth={1500}
                    setPoint={setPoint}
                    ballDirection={ballDirection}
                    setLastpoint={setLastPoint}></Canvas>
            </>
            {/* } */}
        </div>
    )

}

export default PlayGround;