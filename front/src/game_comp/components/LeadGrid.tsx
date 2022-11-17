import './LeadGrid.css'
import { createStyles, Card, Image, Text,  Modal, useMantineTheme ,AspectRatio } from '@mantine/core';
import { Center } from '@mantine/core';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { ClassicModal, AvancedModal } from './Modal';
import classic_logo from '../media/pong_classic_first_frame.png'
import advanced_logo from '../media/pong_advanced_first_frame.png'
import classic_gif from '../media/pong_classic.gif'
import advanced_gif from '../media/pong_advanced.gif'
import { stringify } from 'querystring';



function useHover<T>(): [MutableRefObject<T>, boolean] {
  const [value, setValue] = useState<boolean>(false); 
  const ref: any = useRef<T | null>(null);
  const handleMouseOver = (): void => setValue(true);
  const handleMouseOut = (): void => setValue(false);
  useEffect(
    () => {
      const node: any = ref.current;
      if (node) {
        node.addEventListener("mouseover", handleMouseOver);
        node.addEventListener("mouseout", handleMouseOut);
        return () => {
          node.removeEventListener("mouseover", handleMouseOver);
          node.removeEventListener("mouseout", handleMouseOut);
        };
      }
    },
    [ref.current] // Recall only if ref changes
  );
  return [ref, value];
}


export function LeadGrid(props: any) {

  const [hoverRef, isHovered] = useHover<HTMLDivElement>();
  const [hoverRef_2, isHovered_2] = useHover<HTMLDivElement>();

  const [opened_classic, setOpened_classic] = useState(false);
  const [opened_advanced, setOpened_advanced] = useState(false);

  const [gameOptions, setGameOptions] = useState<{type: string, opponent?: string}>({type: ""})

  return (
    <Center>
      <div className='container'>
        <Modal
          opened={opened_classic}
          onClose={() => { setGameOptions({type: ""}); setOpened_classic(false)}}
          withCloseButton={false}
          size="40%"
          padding={0}
          id='rgb_modal'
          radius={15}
          overlayOpacity={0.50}
          overlayBlur={5}>
            <ClassicModal setPlay={props.setPlay} setGameOptions={setGameOptions}/>
        </Modal>
        <Modal
          opened={opened_advanced}
          onClose={() => { setGameOptions({type: ""}); setOpened_advanced(false)}}
          withCloseButton={false}
          size="40%"
          padding={0}
          id='rgb_modal'
          radius={15}
          overlayOpacity={0.50}
          overlayBlur={5}>
            <AvancedModal setPlay={props.setPlay} setGameOptions={setGameOptions}/>
        </Modal>
          <div className='card_text_container card_1'>
            <div className='card classic_card' ref={hoverRef} onClick={() => {setGameOptions({type: "classic"}); setOpened_classic(true)}}>
              <Card  shadow="sm" p="lg" radius={15}>
                <Card.Section>
                  {isHovered ?
                    <Image src={classic_gif} height={"100%"} />
                  :
                    <Image src={classic_logo} height={"100%"} />
                  }
                </Card.Section>
              </Card>
            </div>
              <Text className='game_text_style' align="center" color="white" >
                Classic Pong
              </Text>
          </div>
          <div className='card_text_container card_2'>
            <div className='card advanced_card' ref={hoverRef_2} onClick={() => {setGameOptions({type: "advance"}); setOpened_advanced(true)}}>
              <Card  shadow="sm" p="lg" radius={15}>
              <Card.Section>
                  {isHovered_2 ?
                    <Image src={advanced_gif} height={"100%"} />
                  :
                    <Image src={advanced_logo} height={"100%"} />
                  }
                </Card.Section>
              </Card>
            </div>
              <Text className='game_text_style' align="center" color="white">
                Advanced Pong
              </Text>
            </div>
      </div>
    </Center>
  );
}


/*
const data = [
  {
    game_type: 'Classic Pong',
    video: 'https://cdn.dribbble.com/users/772985/screenshots/2600512/pong.gif',
  },
  {
    game_type: 'Advanced Pong',
    video: 'https://cdn.dribbble.com/users/1000837/screenshots/4349787/ping-pong-game-2.gif',
  }
]

export function LeadGrid() {

  const cards = data.map((games) =>(
    <div className='card_text_container'>
      <div className='card'>
        <Card  shadow="sm" p="lg" radius={15}>
          <Card.Section component="a" href="#">
            <Image src={games.video} height={"100%"} />
          </Card.Section>
      </Card>
    </div>
     <Text className='game_text_style' align="center" color="white">
        {games.game_type}
      </Text>
    </div>
  ));

  return (
    <Center>
       {cards}
    </Center>
  );
}

*/