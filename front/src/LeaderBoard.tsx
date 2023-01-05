import { Student } from "./App";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import './LeaderBoard.css'
import Navigation from "./Navigation";

export interface PlayerInBoard {
    points: number;
    user: {
        username: string,
        nickname: string,
        avatar: string,
    }
}

export default function Leaderboard() {

    const [board, setBoard] = useState<PlayerInBoard[]>([]);
    let afterPodio = 4;

    useEffect(() => {
        const getLeaderBoard = async () => {
            const API_LEADERBOARD = `http://${process.env.REACT_APP_IP_ADDR}:3001/game/getLeaderBoard`;
            let response = await fetch(API_LEADERBOARD);
            let data = await response.json();
            let fetchBoard: PlayerInBoard[] = [];
            await Promise.all(await data.map(async (element: any) => {
                let iBoard: PlayerInBoard = {
                    points: element.points,
                    user: {
                        username: element.user.username,
                        nickname: element.user.nickname,
                        avatar: element.user.avatar
                    }
                }
                fetchBoard.push(iBoard);
            }))
            setBoard(fetchBoard);
        }
        getLeaderBoard();
    }, [])

    return (
        <><Navigation />
            <div className="root-board">
                <div className="leaderboard">
                    <div className="topLeadersList">
                        {board.map((leader, index) => (
                            <div className="leader" key={leader.user.username}>
                                {index + 1 <= 3 && (
                                    <div className="containerImage">
                                        <img className="image" loading="lazy" src={leader.user.avatar} />
                                        <div className="crown">
                                            <svg
                                                id="crown1"
                                                fill="#0F74B5"
                                                data-name="Layer 1"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 100 50"
                                            >
                                                <polygon
                                                    className="cls-1"
                                                    points="12.7 50 87.5 50 100 0 75 25 50 0 25.6 25 0 0 12.7 50"
                                                />
                                            </svg>
                                        </div>
                                        
                                        <div className="leaderName">{leader.user.username}</div>
                                        <div className="leaderPoints">{leader.points}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="playerslist">
                        <h1 style={{ textAlign: 'center', padding: '3%', fontFamily: 'Smooch Sans, sans-serif', letterSpacing: '0.2rem', fontSize: '2vw', color: '#fff', marginTop: '8vh' }}>TOP 10</h1>
                        <div className="table">
                        </div>
                        <div className='places-list-container'>
                            {
                                board.slice(3).map((element) => (<div className='list-item' key={element.user.username}>
                                    <div className='position'>
                                        {afterPodio++}
                                    </div>
                                    <div className='class-information'>
                                        <div className='title'>
                                            <img className="image" src={element.user.avatar} />
                                            <p className="p_leaderboard"> {`#${element.user.username}`}</p>
                                        </div>
                                    </div>
                                    <div className='steps'>
                                        {element.points}
                                    </div>
                                </div>))
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className='_prv_'></div>
        </>
    );
}