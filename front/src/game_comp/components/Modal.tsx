//import React from 'react'
/*import './Modal.css'*/
import React, { ReactHTMLElement, useContext, useEffect, useState } from "react"
import './ModalGrid.css'
import { forwardRef } from 'react';
import { Group, Avatar, Text, Select, Button } from '@mantine/core';
import { Student } from "../../App";
import { fontSize } from "@mui/system";

export interface RunningMatches {
  playRoom: string;
  typo: string;
  player1: string;
  player2: string;
  avatar1?: string;
  avatar2?: string;
}

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} />

        <div>
          <Text size="sm">{label}</Text>
        </div>
      </Group>
    </div>
  )
);

function Demo(props: any) {

  const [friendsOnline, setFriendsOnline] = useState<{
    image: string;
    label: string;
    value: string;
  }[]>([])
  const [userToPlayWith, setUserToPlayWith] = useState<string | null>(null)

  useEffect(() => {
    async function getFriensOnline() {
      let response = await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/users/getOnlineFriends/${props.client}`);
      let data = await response.json();
      let fetchFriendsOnline: {
        image: string;
        label: string;
        value: string;
      }[] = [];
      await Promise.all(await data?.map(async (element: any) => {
        let iFriendsOnline: {
          image: string;
          label: string;
          value: string;
        } = {
          image: element.user.avatar,
          label: element.user.nickname,
          value: element.user.username,
        }
        fetchFriendsOnline.push(iFriendsOnline);
      }))
      setFriendsOnline(fetchFriendsOnline);
    }
    getFriensOnline();
  }, [])

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection:"column" }}>
      <Select
      style={{width:"50%", height:"70px"}}
        placeholder="Pick one"
        variant='unstyled'
        transition={"scale-y"}
        transitionDuration={200}
        data={friendsOnline}
        itemComponent={SelectItem}
        onChange={(e) => setUserToPlayWith(e)}
        maxDropdownHeight={400}
        nothingFound="Nobody here"
        styles={() => ({
          item: {
            '&[data-hovered]': {
              backgroundColor: 'darkgrey',
              color: 'black'
            },
          }
        })}
      />
      <Button style={{width:"35%", height:"30px"}} onClick={() => props.inviteUserToPlay(userToPlayWith)} disabled={!Boolean(userToPlayWith)} >
        Confirm
      </Button>
    </div>
  );
}

function RunningMatchesList(props: any){
  const [runningMatches, setRunningMatches] = useState<RunningMatches[]>([])

  useEffect(() => {
    async function getRunningMatches() {
      let response = await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/game/get${props.typo}RunningMatches`);
      let data = await response.json();
      let fetchRunningMatches: RunningMatches[] = [];
      await Promise.all(await data.map(async (element: any) => {
        let iRunningMatches: RunningMatches = {
          playRoom: element.playRoom,
          typo: props.typo,
          player1: element.player1,
          player2: element.player2,
          avatar1: element.avatar1,
          avatar2: element.avatar2,
        }
        fetchRunningMatches.push(iRunningMatches);
      }))
      setRunningMatches(fetchRunningMatches);
    }
    getRunningMatches();
  }, [])

  useEffect(() => {
    props.socket?.on("watchGameConfirm",
        (data: {nameRoom: string, leftClient:string, rightClient:string, leftPoints:number, rightPoints:number}) => {
          props.setGameData({roomName: data.nameRoom, leftPlayer: data.leftClient, rightPlayer: data.rightClient})
          props.setPoint({left: data.leftPoints, right:data.rightPoints})
          props.setPlay(true)
          props.setLoader(false);
    }
  )
  }, [props.socket])

  function handleClick(playRoom: string){
    props.socket?.emit("watchGameRequest", { namePlayRoom: playRoom})
  }

  return (
    <>
    { runningMatches.map(function(element: any){
        return (
          <div className="running_matches_holder" key={element.playRoom} onClick={() => handleClick(element.playRoom)}>
              <div className="running_matches">
                <Avatar radius={10} style={{marginRight:"1%"}} src={element.avatar1}></Avatar>
                {element.player1 + " VS " + element.player2}
                <Avatar radius={10} style={{marginLeft:"1%"}} src={element.avatar2}></Avatar>
              </div>
          </div>
        )
      }
    )}
    </>
  )
}

export function ClassicModal(props: any) {
  

  const contextData = useContext(Student)

  async function inviteUserToPlay(userToPlayWith: string){
    const API_URL_CREATE_DIRECT_GAME = `http://${process.env.REACT_APP_IP_ADDR}:3001/game/createDirectGame`;
		const API_URL_INVITE_TO_GAME = `http://${process.env.REACT_APP_IP_ADDR}:3001/navigation/inviteToGame`;
		const API_URL_UPDATE_BELL = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/bellUserToUpdate`;
		await fetch(API_URL_CREATE_DIRECT_GAME, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({client: contextData.username, userToPlayWith: userToPlayWith, type: props.typo}),
		})
		await fetch(API_URL_INVITE_TO_GAME, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({client: contextData.username, userToPlayWith: userToPlayWith}),
		})
		await fetch( API_URL_UPDATE_BELL, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({bellUserToUpdate: userToPlayWith}),
		})
    props.checkInvite();
		//navigate('/game');
	}

  return (
    <div className="classic_grid_container" >
      <div className="grid_item_1" onClick={() => props.handleSetPlay(true)}>
        <div className="logo_holder">
          <p className="logo">Matchmaking</p>
        </div>
      </div>
      <div className="grid_item_2">
        <Demo client={contextData.username} setGameOptions={props.setGameOptions} inviteUserToPlay={inviteUserToPlay} />
      </div>
      <div className="grid_item_3"> LISTA PARTITE IN CORSO <RunningMatchesList socket={props.socket} setLoader={props.setLoader} setPoint={props.setPoint} setGameData={props.setGameData} setPlay={props.setPlay} typo={props.typo}/>
      </div>
    </div>
  )
}

export function AvancedModal(props: any) {
  return (
    <div className='advanced_grid_container'>
    </div>
  )
}



/*
const data = [
  {
    image: 'https://img.icons8.com/clouds/256/000000/futurama-bender.png',
    label: 'Bender Bending Rodríguez',
    value: 'Bender Bending Rodríguez',
  },

  {
    image: 'https://img.icons8.com/clouds/256/000000/futurama-mom.png',
    label: 'Carol Miller',
    value: 'Carol Miller',
  },
  {
    image: 'https://img.icons8.com/clouds/256/000000/homer-simpson.png',
    label: 'Homer Simpson',
    value: 'Homer Simpson',
  },
  {
    image: 'https://img.icons8.com/clouds/256/000000/spongebob-squarepants.png',
    label: 'Spongebob Squarepants',
    value: 'Spongebob Squarepants',
  },
];

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} />

        <div>
          <Text size="sm">{label}</Text>
        </div>
      </Group>
    </div>
  )
);

function Demo() {
  return (
    <Select
      placeholder="Pick one"
      variant='unstyled'
      transition={"scale-y"}
      transitionDuration={200}
      data={data}
      itemComponent={SelectItem}
      maxDropdownHeight={400}
      nothingFound="Nobody here"
      styles={() =>({
        item: {
          '&[data-hovered]':{
            backgroundColor: 'darkgrey',
            color: 'black'
          },
        }
      })}
    />
  );
}
/*
export function ClassicModal() {
  return (
    <div className="classic_modal_container">
      <div className="random_game_container text">
        <p className='random_game_logo'>
          <span className='logo_span_letter'>L</span>
          <span className='logo_span_letter'>e</span>
          <span className='logo_span_letter'>t</span>
          <span className='logo_span_letter'>'</span>
          <span className='logo_span_letter'>s</span>
          <span className='logo_span_letter'>&nbsp;P</span>
          <span className='logo_span_letter'>l</span>
          <span className='logo_span_letter'>a</span>
          <span className='logo_span_letter'>y</span>
        </p>
        <a href="#" className='play_button_logo'>Click Me</a>
      </div>
      {Demo()}
      /*<div className='select_friend_game text' >SFIDA UN AMICO</div>
    </div>
  )
}

export function AvancedModal() {
  return (
  <div className='advanced_modal_container'>
    <div className="random_game text">ADVANCED: RICERCA GIOCATORE</div>
    <div className='select_friend_game text'>SFIDA UN AMICO</div>
  </div>
  )
}

*/

/*
function Demo() {
  return (
    <Select
    variant="unstyled"
    placeholder='Pick a friend ...'
    rightSection={<></>}
    size="xl"
    transition={"scale-y"}
    transitionDuration={200}
  	
    data={[
      { value: 'react', label: 'React' },
      { value: 'ng', label: 'Angular' },
      { value: 'svelte', label: 'Svelte' },
      { value: 'vue', label: 'Vue' },
    ]}
    />
  );
  }

*/