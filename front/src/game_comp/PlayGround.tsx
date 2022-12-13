import { Button, Center, Modal } from "@mantine/core"
import { positions } from "@mui/system"
import { useContext, useEffect, useLayoutEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Student } from "../App"
import Loader from "../components/Loader"
import Canvas from "./Canvas"
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

    //console.log("SOCKET = ", props.socket);

    const navigate = useNavigate()
    const contextData = useContext(Student)
    // const [loader, setLoader] = useState<boolean>(true);
    const [clientSide, setClientSide] = useState<Paddle>({ name: contextData.username, side: '', playRoom: '' });
    const [opponentSide, setOpponentSide] = useState<Paddle>({ name: '', side: '', playRoom: '' });
    const [point, setPoint] = useState<Point>({
        left: 0,
        right: 0
    })
    const [winner, setWinner] = useState("")
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
        props.socket.once('endGame', (winner: string) => {
            //console.log(winner);
            setWinner(winner)
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
            {winner ? <Modal styles={(root) => ({
                body: {
                    backgroundColor: '#fff',
                    textAlign: 'center',
                },
            })}
                onClose={() => console.log("si cazzo!!!!!")}
                opened={winner ? true : false}
                transitionDuration={600}
                style={{ backgroundColor: "black", zIndex: "5", }}
                centered
                withCloseButton={false}
                size="lg"
                overlayOpacity={0.50}
                overlayBlur={5}
            >
                <div>
                    <div className="inner1">
                        {winner === 'left' ? <h1 style={{ padding: "5%" }}>Opponent left the room! 🤪</h1> :
                            (contextData.username === winner ? <h1 style={{ padding: "5%" }}>You Won! 🥳</h1> :
                                <h1 style={{ padding: "5%" }}>You Lost.. 😭</h1>)}
                    </div>
                    {/* style={{width:"50%", display:"flex", justifyContent:"center"}} */}
                    <div className="inner2">
                        <Button
                            style={{ margin: "1%" }}
                            radius="lg"
                            size="md"
                            variant="gradient"
                            gradient={{ from: 'black', to: 'grape', deg: 55 }}
                            onClick={() => navigate('/home')}
                        >
                            Back to home
                        </Button>
                        <Button
                            style={{ margin: "1%" }}
                            radius="lg"
                            size="md"
                            variant="gradient"
                            gradient={{ from: 'black', to: 'pink', deg: 55 }}
                        // onClick={console.log("pipo")}
                        >
                            Rematch
                        </Button>
                    </div>
                </div>
            </Modal> :
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
                    setOpponentSide={setOpponentSide}
                    setLastpoint={setLastPoint}></Canvas>
            }
        </div>
    )
}

export default PlayGround;