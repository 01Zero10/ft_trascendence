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

  useEffect(() => {
    async function getFriensOnline() {
      let response = await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/users/getOnlineFriends/${props.client}`);
      let data = await response.json();
      //console.log(response);
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
    <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
      <Select
        placeholder="Pick one"
        variant='unstyled'
        transition={"scale-y"}
        transitionDuration={200}
        data={friendsOnline}
        itemComponent={SelectItem}
        onChange={(e) => console.log(e)}
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
      <Button>
        Confirm
      </Button>
    </div>
  );
}

function RunningMatchesList(props: any){
  const [runningMatches, setRunningMatches] = useState<RunningMatches[]>([])

  const runningMatchesList_style_container = {
    display:"flex",
    width:"80%",
    borderRadius:"5px", 
    backgroundColor:"red", 
    margin:"0 auto 2%",
    justifyContent:"center",
    alignItems:"center"
  }

  const runningMatchesList_style = {
    fontSize: "1.15rem"
  }

  useEffect(() => {
    async function getRunningMatches() {
      console.log(`http://${process.env.REACT_APP_IP_ADDR}:3001/game/get${props.typo}RunningMatches`)
      let response = await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/game/get${props.typo}RunningMatches`);
      let data = await response.json();
      let fetchRunningMatches: RunningMatches[] = [];
      await Promise.all(await data.map(async (element: any) => {
        let iRunningMatches: RunningMatches = {
          playRoom: element.playRoom,
          typo: props.typo,
          player1: element.player1,
          player2: element.player2,
        }
        fetchRunningMatches.push(iRunningMatches);
      }))
      setRunningMatches(fetchRunningMatches);
    }
    getRunningMatches();
  }, [])

  return (
    <>
    { runningMatches.map(function(element: any){
        console.log(element)
        return (

          <div style={runningMatchesList_style_container} key={element.playRoom}>
            <div style={runningMatchesList_style}>{element.player1} VS {element.player2}</div>
          </div>
        )
      }
    )}
    </>
  )
}

export function ClassicModal(props: any) {

  const contextData = useContext(Student)


  return (
    <div className="classic_grid_container" >
      <div className="grid_item_1" onClick={() => props.setPlay(true)}>
        <div className="logo_holder">
          <p className="logo">Matchmaking</p>
        </div>
      </div>
      <div className="grid_item_2">
      </div>
      <div className="grid_item_3"> LISTA PARTITE IN CORSO<RunningMatchesList typo={props.typo}/></div>
      <Demo client={contextData.username} setGameOptions={props.setGameOptions} />
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