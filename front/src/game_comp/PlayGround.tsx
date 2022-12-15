import { Button, Center, Modal } from "@mantine/core"
import React, { useContext, useEffect, useLayoutEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Student } from "../App"
import Canvas from "./Canvas"

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
    const navigate = useNavigate()
    const student = useContext(Student)
    const [gameData, setGameData] = useState<{roomName: string, leftPlayer: string, rightPlayer: string}>({
        roomName:"",
        leftPlayer:"",
        rightPlayer:""
    })
    const [point, setPoint] = useState<Point>({
        left: 0,
        right: 0
    })
    const [winner, setWinner] = useState("")

    useEffect(() => {
        props.socket.emit('connectToGame', { username: student.username, avatar: student.avatar });
    }, [])


    useEffect(() => {
        // props.socket.on('connectedToGame', (namePlayRoom: string, side: string) => {
        //     if (side === 'right')
        //         props.socket.emit('requestOpponent', { namePlayRoom: namePlayRoom, side: side })
        // })
        props.socket.once('endGame', (winner: string) => {
            setWinner(winner)
        })
    }, [props.socket])

    return (
        <div style={{backgroundColor:"#000000"}}>
            {winner ? <Modal styles={(root) => ({
                body: {
                    backgroundColor: '#fff',
                    textAlign: 'center',
                },
            })}
                onClose={() => console.log("si cazzo!!!!!")}
                opened={!!winner}
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
                            (student.username === winner ? <h1 style={{ padding: "5%" }}>You Won! 🥳</h1> :
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
                        >
                            Rematch
                        </Button>
                    </div>
                </div>
            </Modal> :
                <Canvas
                    socket={props.socket}
                    point={point}
                    canvasHeight={500}
                    canvasWidth={1000}
                    setPoint={setPoint}
                    gameData={gameData}
                    setGameData={setGameData}
                    />
            }
        </div>
    )
}

export default PlayGround;