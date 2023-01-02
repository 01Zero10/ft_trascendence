import './LeadGrid.css'
import { createStyles, Card, Image, Text, Modal, useMantineTheme, AspectRatio } from '@mantine/core';
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
  //const [gameOptions, setGameOptions] = useState<{ type: string, opponent?: string }>({ type: "" })

  return (
    <Center>
      <div className='container'>
        <Modal
        styles={(root) => ({
          inner:{
              backgroundColor: 'transparent',
          },
          modal: {
              backgroundColor: 'transparent',
              display: "flex",
              flexDirection:"column" ,
              alignItems:"center",
              justifyContent:"center",
              margin: 0,
          },
          body:{
              width:"100%",
              height:"80%",
              backgroundColor: 'transparent',
              textAlign: 'center',
          },
      })} 
          opened={opened_classic}
          onClose={() => { props.setGameOptions({ type: "" }); setOpened_classic(false) }}
          withCloseButton={false}
          closeOnClickOutside={false}
          size="40%"
          padding={0}
          id='rgb_modal'
          radius={15}
          centered
          overlayOpacity={0.50}
          overlayBlur={5}>
          <ClassicModal socket={props.socket} checkInvite={props.checkInvite} setPlay={props.setPlay} setLoader={props.setLoader} handleSetPlay={props.handleSetPlay} setGameData={props.setGameData} point={props.point} setPoint={props.setPoint} setGameOptions={props.setGameOptions} typo={'classic'} />
          <button className='gameModalCloseButton_holder' onClick={() => setOpened_classic(false)}><div className='gameModalCloseButton'> CLOSE </div></button>
        </Modal>
        <Modal
        styles={(root) => ({
          inner:{
              backgroundColor: 'transparent',
          },
          modal: {
              backgroundColor: 'transparent',
              display: "flex",
              flexDirection:"column" ,
              alignItems:"center",
              justifyContent:"center",
              margin: 0,
          },
          body:{
              width:"100%",
              height:"80%",
              backgroundColor: 'transparent',
              textAlign: 'center',
          },
      })} 
          opened={opened_advanced}
          onClose={() => { props.setGameOptions({ type: "" }); setOpened_advanced(false) }}
          withCloseButton={false}
          closeOnClickOutside={false}
          size="40%"
          padding={0}
          id='rgb_modal'
          radius={15}
          centered
          overlayOpacity={0.50}
          overlayBlur={5}>
          <ClassicModal socket={props.socket} checkInvite={props.checkInvite} setPlay={props.setPlay} setLoader={props.setLoader} handleSetPlay={props.handleSetPlay} setGameData={props.setGameData} point={props.point} setPoint={props.setPoint} setGameOptions={props.setGameOptions} typo={'advanced'} />
          <button className='gameModalCloseButton_holder' onClick={() => setOpened_advanced(false)}><div className='gameModalCloseButton'> CLOSE </div></button>
        </Modal>
        <div className='card_text_container card_1'>
          <div className='card classic_card' ref={hoverRef} onClick={() => { props.setGameOptions({ type: "classic" }); setOpened_classic(true) }}>
            <Card shadow="sm" p="lg" radius={15}>
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
          <div className='card advanced_card' ref={hoverRef_2} onClick={() => { props.setGameOptions({ type: "advanced" }); setOpened_advanced(true) }}>
            <Card shadow="sm" p="lg" radius={15}>
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