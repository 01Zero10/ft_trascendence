import React, { ReactNode, useContext, useEffect, useState } from "react";
import './Account.css'
import { Rooms, student, Student } from "./App";

import { Avatar, Badge, Fab, Grid, IconButton, List, ListItem, ListItemText, styled, Tab } from "@mui/material";
import { useParams } from "react-router-dom";
import { AddCircle, Block, CheckCircle, Close, Done, EmojiEvents, HourglassTop, PersonAddAlt1, PersonRemove } from "@mui/icons-material";
import Tabs from '@mui/material/Tabs';

import { red } from "@mui/material/colors";
import { FocusTrap } from "@mantine/core";
import Navigation from "./Navigation";

export interface AccountInfo {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  two_fa_auth: boolean;
  tfa_checked?: boolean;
  blockedUsers?: string[];
  rooms?: Rooms[] | null;
  twoFaAuthSecret?: string;
  socket_id?: string;
  position: {points: number, position: number} | null
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

//Modal

interface ModalType {
  children?: ReactNode;
  isOpen: boolean;
  toggle: () => void;
}

interface FriendShip {
  friendship: string,
  sender: string | null,
  user1: string,
  user2: string,
}

interface FriendshipsUser {
  username: string,
  nickname: string,
  avatar: string,
  position: string,
  friendship: FriendShip | null,
}

function Modal(props: ModalType) {

  return (
    <>
      {props.isOpen && (
        <div id="modal-overlay" className="modal-overlay" onClick={props.toggle}>
          <div id="modal-boxi" onClick={(e) => e.stopPropagation()} className="modal-box">
            {props.children}
          </div>
        </div>
      )}
    </>
  );
}

function useModal() {
  const [isOpen, setisOpen] = useState(false);

  const toggle = () => {
    setisOpen(!isOpen);
  };

  if (!isOpen) {
    var close_ = document.getElementById('modal-boxi');
    if (close_ != null) { close_.classList.add('close-modal') }
  }

  const handleClose = () => setisOpen(false);

  return {
    isOpen,
    toggle,
    handleClose
  };
}

//Tabella /leaderboard

//fill table
interface Match {
  id: number, //con Number rompe le scatole / si potrebbe mettere any
  // player1: string;
  // player2: string;
  // avatar1: string;
  // avatar2: string;
  player1: {username: string,
    nickname: string,
    avatar: string},
  player2: {username: string,
    nickname: string,
    avatar: string},
  points1: number,
  points2: number,
}

// Vertical Table

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <div className="table-tabs">{children}</div>
        // <Box sx={{ p: 5 }}>
        //   <Typography>{children}</Typography>
        // </Box>
      )}
    </div>
  );
}

function Account() {

  const contextData = useContext(Student)
  const [showLoader, setShowLoader] = useState(true);
  const [friendship, setFriendship] = useState("nope");
  const [blocked, setBlocked] = useState<boolean>(false);

  const [client, setClient] = useState<AccountInfo>({
    id: 0,
    username: "",
    nickname: "",
    avatar: "",
    two_fa_auth: false,
    twoFaAuthSecret: undefined,
    position: null
  });


  const { user_id } = useParams();

  useEffect(() => {
    //console.log('user_id: ', user_id);
  }, [user_id])

  async function getUserInfo() {
    const API_URL = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/accountInfo/${user_id}`
    const resp = await fetch(API_URL, {
      credentials: "include",
    }).then()
      const result = await resp.json()
      console.log("result", result);
    setClient({
      id: result.id,
      username: result.username,
      nickname: result.nickname,
      avatar: result.avatar,
      two_fa_auth: result.two_fa_auth,
      position: result.position ? {points: result.position.points, position: result.position.position} : null
    });
      setShowLoader(false);
      
  }

  useEffect(() => {
    getUserInfo();
  }, [user_id])

  useEffect(() =>
    console.log(friendship)
    , [friendship])

  useEffect(() => {
    const API_URL = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/checkFriendship`
    const getFriendshipInfo = async () => {
      await fetch(API_URL, {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client1: contextData.username, client2: user_id }),
      })
        .then((response) => response.json())
        .then((result) => {
          //console.log("result = ", result);
          if (result.sender && result.sender != contextData.username)
            setFriendship("toReply")
          else
            setFriendship(result.friendship);
          //setShowLoader(false);
        })
        .catch(() => setFriendship("nope"));
    }
    getFriendshipInfo();
  }, [user_id])

  async function checkBlocked(){
  const API_URL = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/checkBlock`
    const res = await fetch(API_URL, {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: contextData.username, userToCheck: user_id }),
    })
    const data = await res.json();
    setBlocked(data.blocked);
  }

  useEffect(() => {
    checkBlocked();
  }, [user_id])

  useEffect(() => {
    console.log("utente bloccato? ", blocked)
  }, [blocked]); //stampa se utente visualizzato é stato bloccato dal client oppure no

  /* prende l'object intero */
  /*   const ciao = useParams<"user_id">();

    useEffect(() => {
      //console.log(ciao);
    }, [ciao]) */

  //PROVA ALERT PER RICHIESTA
  // if (friendship === 'toReply') {alert(`${user_id} sent you a friend request`)}


  //Per lista amici e visualizzare in account

  const [friendsUser, setFriendsUser] = useState<FriendshipsUser[]>([]);
  const [friendRequest, setFriendsRequest] = useState<FriendshipsUser[]>([]);
  console.log("qui_5", friendsUser);

  useEffect(() => {
    const API_URL_GET_FRIENDS = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/getFriends`;
    const getFriends = async () => {
      await fetch(API_URL_GET_FRIENDS, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: contextData.username, profileUser: user_id }),
      })
        .then((response) => response.json())
        .then(async (result) => {
          const fetchFriends: FriendshipsUser[] = [];
          await Promise.all(await result.map(async (element: any) => {
            if (element.username !== contextData.username) {
              let iFriend: FriendshipsUser = {
                username: element.username,
                nickname: element.nickname,
                avatar: element.avatar,
                position: element.position,
                friendship: element.friendship,
              }

              fetchFriends.push(iFriend);
            }
          }))
          setFriendsUser(fetchFriends);
        }
        )
    }
    getFriends();
  }, [user_id])

  useEffect(() => {
    const API_URL_GET_FRIENDS = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/getFriendsRequest`;
    const getFriendsRequest = async () => {
      await fetch(API_URL_GET_FRIENDS, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: contextData.username, profileUser: user_id }),
      })
        .then((response) => response.json())
        .then(async (result) => {
          const fetchFriendsRequest: FriendshipsUser[] = [];
          await Promise.all(await result.map(async (element: any) => {
            if (element.username !== contextData.username) {
              let iFriendRequest: FriendshipsUser = {
                username: element.username,
                nickname: element.nickname,
                avatar: element.avatar,
                position: element.position,
                friendship: element.friendship,
              }
              fetchFriendsRequest.push(iFriendRequest);
            }
          }))
          setFriendsRequest(fetchFriendsRequest);
          console.log(fetchFriendsRequest);
        }
        )
    }
    getFriendsRequest();
  }, [user_id])

  function Scoreboard(props: any) {
    //const contextData = useContext(Student);

    const { isOpen, toggle, handleClose } = useModal();
    const [matches, setMatches] = useState<Match[]>([]);
    //const [client, setClient] = useState<String>(contextData.username)

    const MATCH_API = `http://${process.env.REACT_APP_IP_ADDR}:3001/game/getMatches/${props.client.username}`

    useEffect(() => {
      async function getMatches() {
        //console.log(MATCH_API);
        let response = await fetch(MATCH_API);
        let data = await response.json();
        let fetchMatches: Match[] = [];

        await Promise.all(await data.map(async (element: Match) => {
        //await data.forEach((element: Match) => {
          console.log(element);
          let iMatch: Match = {
            id: element.id,
            player1: element.player1,
            player2: element.player2,
            points1: element.points1,
            points2: element.points2
          };
          fetchMatches.push(iMatch);
        }))
        setMatches(fetchMatches);
      }
      if (client.username)
        getMatches();
    }, [props.client])
    //console.log(matches);

    return (
      <>
        <div className="table_dashboard">
          {matches.map((p) => (
            <List sx={{ width: '100%', bgcolor: 'transparent', display: 'flex' }} key={p.id}>
              <ListItem>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar sx={{ width: 56, height: 56 }} src={p.player1.avatar} />
                  <ListItemText sx={{ color: '#fff' }} primary={p.player1.nickname} />
                </div>
              </ListItem>
              <ListItem>
                <p style={{ fontSize: '1.5vw', fontWeight: '500', color: '#fff' }}>{p.points1}</p>
                <p className="VS"> VS </p>
                <p style={{ fontSize: '1.5vw', fontWeight: '500', color: '#fff' }}>{p.points2}</p>
              </ListItem>
              <ListItem>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar sx={{ width: 56, height: 56 }} src={p.player2.avatar} />
                  <ListItemText sx={{ color: '#fff' }} primary={p.player2.nickname} />
                </div>
              </ListItem>
            </List>
          ))}
        </div>
      </>
    );
  }

  // Lista degli amici quando si clicca il bottone
  function Friends_b() {
    const { isOpen, toggle, handleClose } = useModal();

    return (
      <>
        {/* <Modal isOpen={isOpen} toggle={toggle}>
          <button className="modal_close_button" type="button" onClick={handleClose}>X</button> */}
        <div id="idea" className="table_dashboard">
          {friendsUser.map((f) => (
            <List sx={{ width: '100%', bgcolor: 'transparent', display: 'flex', alignItems: 'center' }} key={f.friendship?.friendship}>
              <ListItem>
                <Avatar sx={{ width: 56, height: 56 }} src={f.avatar} />
                <ListItemText primary={f.username} secondary={f.nickname} sx={{ color: '#fff !important' }} />
              </ListItem>
              <ListItem>
                <div style={{ textAlign: 'center' }}>
                  <EmojiEvents sx={{ width: 40, height: 40, color: 'rgba(102, 38, 238, 1)' }} />
                  <p className="p_friendlist"> {`#${f.position}`}</p>
                </div>
              </ListItem>
              <ListItem>
                {user_id === contextData.username && f.username === user_id ? 'nope' :
                  (f.friendship && f.friendship.friendship === 'pending') ?
                    <Pending_b_small username={f.username} /> : (f.friendship && f.friendship.friendship === 'friends') ?
                      <div style={{ textAlign: 'center', color: '#fff' }} ><CheckCircle sx={{ color: '#6626ee', paddingBottom: '5%' }} />
                        <p className="p_friendlist" /> FRIEND</div> :
                      <div style={{ textAlign: 'center', color: '#fff' }} ><IconButton sx={{ color: '#e91e63', paddingBottom: '5%' }} component="label"
                        onClick={() => addFriend(f.username!)}>
                        <AddCircle fontSize="medium" />
                      </IconButton>
                        <p className="p_friendlist" />ADD FRIEND</div>
                  /* <Remove_b_small /> : <Add_b_small />*/
                }
              </ListItem>
            </List>
          ))}
        </div>
        {/* </Modal> */}
      </>
    )
  }

  /*****Per Lista amici pulsanti****/
  function Pending_b_small(props: any) {
    return (
      <div className="profile-card-inf__item">
        <Grid item xs={3}>
          <IconButton color="secondary" component="label"
            onClick={() => deleteRequestOrFriendship(props.username)}>
            <HourglassTop sx={{ width: 50, height: 50, color: 'rgba(102, 38, 238, 1)' }} />
          </IconButton>
          <div className="profile-card-inf__title"></div>
          {/* <h1 style={{ textAlign: 'center', color: '#fff', fontSize: '1vw' }}>PENDING</h1> */}
        </Grid>
      </div>
    )
  }

  function SendNotification_small(props: any) {

    const yepHandler = async () => {
      console.log("ciao = ", props.userToAccept);
      const API__REQUEST = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/acceptFriendRequest`;
      await fetch(API__REQUEST, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: contextData.username, profileUser: props.userToAccept })
      })
    }

    return (
      <>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ margin: '0.5rem 4rem' }}>
              <Fab color="secondary" aria-label="user" onClick={yepHandler}>
                <Done />
              </Fab>
              {/* <h3 style={{ fontFamily: 'Smooch Sans, sans-serif', marginTop: '0.5rem', letterSpacing: '0.2rem', fontSize: '1vw' }}>ACCEPT</h3> */}
            </div>
            <div style={{ margin: '0.5rem 4rem' }}>
              <Fab color="secondary" aria-label="user" onClick={() => deleteRequestOrFriendship(props.userToAccept)}>
                <Close />
              </Fab>
              {/* <h3 style={{ fontFamily: 'Smooch Sans, sans-serif', marginTop: '0.5rem', letterSpacing: '0.2rem', fontSize: '1vw' }}>DECLINE</h3> */}
            </div>
          </div>
        </div>
      </>
    )
  }

  /******* FINE *******/

  async function deleteRequestOrFriendship(userToDelete: string) {
    const API_DELETE_REQ_OR_FRIEND = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/deleteRequestOrFriendship`
    await fetch(API_DELETE_REQ_OR_FRIEND, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: contextData.username, profileUser: userToDelete })
    })
    setFriendship("nope");
  }

  async function blockOrUnblockUser(userToBlock: string) {
    const API_BLOCK_OR_UNBLOCK_FRIEND = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/blockUser`
    await fetch(API_BLOCK_OR_UNBLOCK_FRIEND, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: contextData.username, userToBlock: userToBlock })
    })
    setFriendship("nope");
    await checkBlocked();
  }

  function Pending_b() {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ padding: '1.5rem' }}>Pending request {client.username}</h2>
        <Fab color="secondary" aria-label="user" onClick={() => deleteRequestOrFriendship(user_id!)}>
          <HourglassTop fontSize="large" />
        </Fab>
        <h3 style={{ fontFamily: 'Smooch Sans, sans-serif', letterSpacing: '0.2rem', fontSize: '1.4vw', padding: '10px' }}>PENDING</h3>
      </div>
    )
  }

  function Remove_b() {
    return (
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'Smooch Sans, sans-serif', letterSpacing: '0.2rem', padding: '1.5rem', fontSize: '1.4vw' }}>Remove <strong className="txt-account-strong"> {client.username}</strong> as a friend?</h3>
        <Fab color="secondary" aria-label="user" onClick={() => deleteRequestOrFriendship(user_id!)}>
          <PersonRemove fontSize="large" />
        </Fab>
        {/* <h3 style={{fontFamily: 'Smooch Sans, sans-serif', letterSpacing: '0.2rem', fontSize: '1.4vw', padding: '10px' }}>REMOVE<br/>FRIEND</h3> */}
      </div>
    )
  }


  async function addFriend(userToSend: string) {
    const API_ADDFRIEND = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/addFriend`
    await fetch(API_ADDFRIEND, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: contextData.username, profileUser: userToSend })
    })
    if (userToSend === user_id)
      setFriendship("pending");
  }

  function Add_b() {
    return (
      <div style={{ textAlign: 'center' }}>
        <h3 className="txt-account">Add <strong className="txt-account-strong"> {client.username}</strong> as a friend?</h3>
        <Fab color="secondary" aria-label="user" onClick={() => addFriend(user_id!)}>
          <PersonAddAlt1 fontSize="large" />
        </Fab>
        {/* <h3 style={{fontFamily: 'Smooch Sans, sans-serif', letterSpacing: '0.2rem', fontSize: '1.4vw', padding: '10px' }}>REMOVE<br/>FRIEND</h3> */}
      </div>
    )
  }

  function SendNotification() {

    const yepHandler = async () => {
      const API_ACCEPT_REQUEST = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/acceptFriendRequest`;
      await fetch(API_ACCEPT_REQUEST, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: contextData.username, profileUser: user_id })
      })
      setFriendship('friends')
    }

    return (
      <>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'Smooch Sans, sans-serif', letterSpacing: '0.2rem', padding: '1.5rem', fontSize: '1.4vw' }}><strong className="txt-account-strong"> {client.username}</strong> sent you a friend request</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ margin: '0.5rem 4rem' }}>
              <Fab color="secondary" aria-label="user" onClick={yepHandler}>
                <Done fontSize="large" />
              </Fab>
              <h3 style={{ fontFamily: 'Smooch Sans, sans-serif', marginTop: '0.5rem', letterSpacing: '0.2rem', fontSize: '1.4vw' }}>ACCEPT</h3>
            </div>
            <div style={{ margin: '0.5rem 4rem' }}>
              <Fab color="secondary" aria-label="user" onClick={() => deleteRequestOrFriendship(user_id!)}>
                <Close fontSize="large" />
              </Fab>
              <h3 style={{ fontFamily: 'Smooch Sans, sans-serif', marginTop: '0.5rem', letterSpacing: '0.2rem', fontSize: '1.4vw' }}>DECLINE</h3>
            </div>
          </div>
        </div>
      </>
    )
  }

  function Block_b() {
    return (
      <div style={{ textAlign: 'center' }}>
        <Fab color="secondary" aria-label="user" onClick={() => {blockOrUnblockUser(user_id!)}}>
          <Block fontSize="large" />
        </Fab>
        {blocked === false ? 
        <h3 className="block-button-txt">BLOCK</h3>
      : <h3 className="block-button-txt">UNBLOCK</h3>}
        
      </div>
    )
  }

  function a11yProps(index: number) {
    return {
      id: `vertical-tab-${index}`,
      'aria-controls': `vertical-tabpanel-${index}`,
    };
  }

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  //Modificare qui per account personale

  function My_Wrap() {

    return (
      <>
        <div className="request">
          <h1 style={{ textAlign: 'center', padding: '3%', fontFamily: 'Smooch Sans, sans-serif', letterSpacing: '0.2rem', fontSize: '2.5vw', color: '#fff' }}>Friendship Request</h1>
          <div className="table_dashboard">
          {friendRequest.map((account) => (
            //<List sx={{ width: '100%', bgcolor: 'transparent', display: 'flex', alignItems: 'center' }} key={account.username}>
                <div className="request-list">
                  <div className="avatar__img-request">
              <img src={account.avatar}></img>
            </div>
              <p style={{ fontSize: '1vw', fontWeight: '500', color: '#fff' }}>{account.username}</p>
                  { account.friendship ? <SendNotification_small userToAccept={account.username} /> : '' }
                </div>       
          ))}
          </div>
        </div>
      </>
    )
  }

  function DisplayNone () {
    const none = document.getElementById('idea');

    if (none != null) {
      none.style.display = 'none';  
    }
    return (
      <><h1 style={{ color: '#fff', fontFamily: 'Smooch Sans, sans-serif', textAlign: 'center' }}>This User is blocked</h1></>
    )
  }

  function DisplayBlock () {
    const none_2 = document.getElementById('idea-2');

    if (none_2 != null) {
      none_2.style.display = 'none';
    }
    return (
      <>
      <div className="box-item" style={{ justifyContent: 'center', backgroundImage: 'none', background: 'rgba(0, 0, 0, 0.5)' }}>
        <h1 style={{ color: 'grey', fontFamily: 'Smooch Sans, sans-serif', textAlign: 'center', fontSize: '4vw', marginTop: '15%' }}>You've blocked this user.</h1>
      </div>
      </>
    )
  }

  console.log("client", client)
  return (
    <>
      <Navigation />
      <div className="wrap">
        {contextData.username !== user_id ?
          <div className="request">
            <div>
              <h1 className="friendship-title">Friendship</h1>
              <Block_b />
              {user_id === contextData.username ? '' :
                blocked === true ? <DisplayNone /> :
                  friendship === 'pending' ? <Pending_b /> : 
                  friendship === 'toReply' ?
                  <SendNotification /> : friendship === 'friends' ?
              <Remove_b /> : <Add_b />}
            </div>
          </div>
          : <My_Wrap />}
        <div className="main">
          <div className="account_decoration">
            <div className="avatar__img-account">
              <img src={client.avatar}></img>
            </div>
            <div style={{ float: 'right', width: '70%', alignItems: 'center', justifyContent: 'center' }}>
              <img className="account_decor_top" src="/account_decoration_top.svg" alt="img_account" />
              <div className="txt_container_account">
                <h1 className="txt-account">Player<strong className="txt-account-strong"> {client.nickname}</strong>
                <p className="p-nickname">@{client.username}</p>
                  <h2 className="score__txt">Score {client.position ? client.position.points : "ND"}</h2></h1>
                <h2 className="rank-txt">RANK <br /><h1 className="no-rank">{client.position ? client.position.position : "ND"}</h1></h2>
              </div>
              <img className="account_decor_down" src="/account_decoration_down.svg" alt="img_account" />
            </div>
          </div>
        </div>
{
  blocked === false ?
  <div className="box-item">
          {/* <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224 }}> */}
          {/* MATCHES */}

          <Tabs
          id="idea-2"
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs"
            sx={{ borderRight: 1, borderColor: 'divider', width: '15%' }}
          >
            <Tab sx={{ fontFamily: 'Smooch Sans, sans-serif', letterSpacing: '0.1rem', fontWeight: '600', fontSize: '1.5vw', color: '#fff' }} label="Matches" {...a11yProps(0)} />
            <Tab sx={{ fontFamily: 'Smooch Sans, sans-serif', letterSpacing: '0.1rem', fontWeight: '600', fontSize: '1.5vw', color: '#fff' }} label="Friends" {...a11yProps(1)} />
          </Tabs>
          <TabPanel value={value} index={0}>
            <div>
              <Scoreboard client={client} />
            </div>
          </TabPanel >
          <TabPanel value={value} index={1}>
            <div>
              <Friends_b />
            </div>
          </TabPanel>
        </div>
        : <DisplayBlock />
}
        
      </div>
      <div className='_prv_'></div>
    </>
  )
}
export default Account;