import {useEffect, useLayoutEffect, useState} from "react"
import Canvas from "./canvas2"
import Score from "./Score"

type Point = {
    left: number
    right: number
}

function PlayGround() {
    const [point, setPoint] = useState<Point>({
        left: 0,
        right: 0
    })
    const dir: Array<string> = ["l", "r"]
    const [lastPoint, setLastPoint] = useState<"l" | "r" | null>(null)
    const [ballDirection, setBallDirection] = useState<"l" | "r">(dir[Math.round(Math.random())] as "l" | "r")

    useLayoutEffect( () => {
        if (lastPoint){
            setBallDirection((prevState) => {
                if(prevState === "l")
                    return "r"
                return "l"
            })
        }
    }, [lastPoint])


    return (
        <div>
            <div>
                <Score position={"left"} player={"player1"} total={point.left}></Score>
                <Score position={"right"} player={"player2"} total={point.right}></Score>
            </div>
            <Canvas
                canvasHeight={1000}
                canvasWidth={1000}
                setPoint={setPoint}
                ballDirection={ballDirection}
                setLastpoint={setLastPoint}></Canvas>
        </div>
    )

}

export default PlayGround;