import { Button, Center, Modal } from "@mantine/core"
import React, { useContext, useEffect, useLayoutEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Student } from "../App"
import Canvas from "./Canvas"
import Canvas2 from "./canvas2"
import "./PlayGround.css"

// type Point = {
//     left: number
//     right: number
// }

function PlayGround(props: any) {
    const navigate = useNavigate()
    const student = useContext(Student)

    // const [loader, setLoader] = useState<boolean>(true);
    // const [gameData, setGameData] = useState<{roomName: string, leftPlayer: string, rightPlayer: string}>({
    //     roomName:"",
    //     leftPlayer:"",
    //     rightPlayer:""
    // })
    // const [point, setPoint] = useState<Point>({
    //     left: 0,
    //     right: 0
    // })
    const [winner, setWinner] = useState("")

    // useEffect(() => {
    //     props.socket.emit('connectToGame', { username: student.username, avatar: student.avatar });
    // }, [])



    useEffect(() => {
        props.socket.once('ready', (data: {namePlayRoom: string, leftClient: string, rightClient: string}) => {
            props.setGameData({
                roomName: data.namePlayRoom,
                leftPlayer: data.leftClient,
                rightPlayer: data.rightClient
            })
            props.setLoader(false);
            if (student.username === data.rightClient)
                props.socket.emit('setStart', data.namePlayRoom);
        })
        props.socket.once('endGame', (winner: string) => {
            setWinner(winner)
        })
        props.socket.once('readyFromInvite', ( data: {namePlayRoom: string, rightClient: string}) => {
            props.setLoader(false);
            if (student.username === data.rightClient)
                props.socket.emit('setStart', data.namePlayRoom);
        })
    }, [props.socket])

    return (
        <div style={{backgroundColor:"transparent", width:"100%", display:"flex", justifyContent:"center", justifyItems:"center"}}>
            {winner ? <Modal styles={(root) => ({
                body: {
                    backgroundColor: '#fff',
                    textAlign: 'center',
                },
            })}
                onClose={() => console.log("Console.log del modal onClose() Playground.tsx")}
                opened={!!winner}
                transitionDuration={600}
                style={{ backgroundColor: "transparent", zIndex: "5", }}
                centered
                withCloseButton={false}
                size="lg"
                overlayOpacity={0.50}
                overlayBlur={5}
            >
                <div style={{display:"flex", justifyContent:"center", justifyItems:"center", flexDirection:"column"}}>
                    <div className="inner1">
                        {winner === 'left' ? <h1 style={{ padding: "5%" }}>Opponent left the room! 🤪</h1> :
                            (student.username === winner ? <h1 style={{ padding: "5%" }}>You Won! 🥳</h1> :
                                <h1 style={{ padding: "5%" }}>You Lost.. 😭</h1>)}
                    </div>
                    {/* style={{width:"50%", display:"flex", justifyContent:"center"}} */}
                    <div className="inner2">
                        <Button
                            className="inner2_button"
                            radius="lg"
                            size="md"
                            variant="gradient"
                            gradient={{ from: 'black', to: 'grape', deg: 55 }}
                            onClick={() => navigate('/home')}
                        >
                            Back to home
                        </Button>
                    </div>
                </div>
            </Modal> :
                <Canvas
                    // dir_y={-3}
                    // ballDirection={"r"}
                    loader={props.loader}
                    socket={props.socket}
                    point={props.point}
                    canvasHeight={500}
                    canvasWidth={1000}
                    setPoint={props.setPoint}
                    gameData={props.gameData}
                    setGameData={props.setGameData}
                    />
            }
        </div>
    )
}

export default PlayGround;