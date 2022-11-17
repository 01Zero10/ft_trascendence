import React from 'react'
/*import './Modal.css'*/
import './ModalGrid.css'
import { forwardRef } from 'react';
import { Group, Avatar, Text, Select } from '@mantine/core';


export function ClassicModal(props: any) {


	return (
	  <div className="classic_grid_container">
      <div className="grid_item_1" onClick={() => props.setPlay(true)}>
        <div className="logo_holder">
          <p className="logo">Matchmaking</p>
        </div>
      </div>
      <div className="grid_item_2">
        </div>
      <div className="grid_item_3">Lista Partite in corso</div>
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