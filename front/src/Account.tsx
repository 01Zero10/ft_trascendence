import React, { ReactNode, useContext, useEffect, useState } from "react";
import './Account.css'
import { student, Student } from "./App";

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import GroupIcon from '@mui/icons-material/Group';
import CoffeeIcon from '@mui/icons-material/Coffee';

import { Avatar, Badge, Box, Divider, Grid, IconButton, List, ListItem, ListItemAvatar, ListItemText, styled, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { AddCircle, CheckCircle, Close, Done, EmojiEvents, HourglassTop, NoAccounts, PersonAddAlt1, PersonRemove } from "@mui/icons-material";
import { Center } from "@mantine/core";
import { red } from "@mui/material/colors";

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
  player1: string;
  player2: string;
  avatar1: string;
  avatar2: string;
  points1: number,
  points2: number,
}


function Scoreboard(props: any) {
  //const contextData = useContext(Student);

  const { isOpen, toggle, handleClose } = useModal();
  const [matches, setMatches] = useState<Match[]>([]);
  //const [client, setClient] = useState<String>(contextData.username)

  const MATCH_API = `http://${process.env.REACT_APP_IP_ADDR}:3001/game/getMatches/${props.client.username}`

  useEffect(() => {
    async function getMatches() {
      console.log(MATCH_API);
      let response = await fetch(MATCH_API);
      let data = await response.json();
      let fetchMatches: Match[] = [];

      await data.forEach((element: Match) => {
        let iMatch: Match = element;
        fetchMatches.push(iMatch);
        setMatches(fetchMatches);
      })
    }
    getMatches();
  }, [props.client])
  console.log(matches);


  return (
    <>
      <Grid item xs={3}>
        <button /*className="b_account"*/ className="noselect" onClick={toggle}>
          <SportsEsportsIcon fontSize="large" /></button>
        <div className="profile-card-inf__title"></div>
        <div className="profile-card-inf__txt">MATCHES</div>

      </Grid>

      <Modal isOpen={isOpen} toggle={toggle}>
        <button className="modal_close_button" type="button" onClick={handleClose}>X</button>
        <div className="table_dashboard">
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            width: '85%',
            maxHeight: 390,
            overflow: "hidden",
            overflowY: "auto",
          }}>
            {matches.map((p) => (
              <List sx={{ width: '100%', bgcolor: 'background.paper' }} key={p.id}>
                <div className="table-prv">
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar alt="username" src={p.avatar1} />
                      <ListItemText primary={p.player1} />
                    </ListItemAvatar>
                  </ListItem>
                  <ListItem >
                    <ListItemText primary={p.points1} />
                    <ListItemText primary=' - ' />
                    <ListItemText primary={p.points2} />
                  </ListItem>
                  <ListItem sx={{ justifyContent: 'center' }}>
                    <ListItemAvatar>
                      <Avatar alt="username" src={p.avatar2} />
                      <ListItemText primary={p.player2} />
                    </ListItemAvatar>
                  </ListItem>
                </div>
                <Divider variant="middle" component="li" />
              </List>
            ))}
          </Box>
        </div>
      </Modal>
    </>
  );
}

function Account() {

  const contextData = useContext(Student)
  const [showLoader, setShowLoader] = useState(true);
  const [friendship, setFriendship] = useState("nope");

  const [client, setClient] = useState<student>({
    id: 0,
    username: "",
    nickname: "",
    avatar: "",
    two_fa_auth: false,
    twoFaAuthSecret: undefined,
    points: 0,
    wins: 0,
    losses: 0,
  });

  const { user_id } = useParams();

  useEffect(() => {
    console.log('user_id: ', user_id);
  }, [user_id])

  useEffect(() => {
    const API_URL = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/${user_id}`
    const getUserInfo = async () => {
      await fetch(API_URL, {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((result) => {
          console.log(result);
          setClient({
            id: result.id,
            username: result.username,
            nickname: result.nickname,
            avatar: result.avatar,
            two_fa_auth: result.two_fa_auth,
            points: result.points,
            wins: result.wins,
            losses: result.losses,
          });
          setShowLoader(false);
        })
        .catch((error) => console.log(error));
    }
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

  /* prende l'object intero */
  /*   const ciao = useParams<"user_id">();
  
    useEffect(() => {
      console.log(ciao);
    }, [ciao]) */

  //PROVA ALERT PER RICHIESTA
  // if (friendship === 'toReply') {alert(`${user_id} sent you a friend request`)}

  // Lista degli amici quando si clicca il bottone
  function Friends_b() {
    const { isOpen, toggle, handleClose } = useModal();

    const [friendsUser, setFriendsUser] = useState<FriendshipsUser[]>([]);
    console.log("qui", friendsUser);

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
              let iFriend: FriendshipsUser = {
                username: element.username,
                nickname: element.nickname,
                avatar: element.avatar,
                position: element.position,
                friendship: element.friendship,
              }
              fetchFriends.push(iFriend);
            }))
            setFriendsUser(fetchFriends);
          }
          )
      }
      getFriends();
    }, [user_id])

    return (
      <>
        <Grid item xs={3}>
          <button className="noselect" onClick={toggle}>
            <GroupIcon fontSize="large" /> </button>
          <div className="profile-card-inf__title"></div>
          <div className="profile-card-inf__txt">FRIENDS</div>
        </Grid>

        <Modal isOpen={isOpen} toggle={toggle}>
          <button className="modal_close_button" type="button" onClick={handleClose}>X</button>
          <div className="table_dashboard">
            <Box sx={{
              display: "flex",
              flexDirection: "column",
              width: '85%',
              maxHeight: 390,
              overflow: "hidden",
              overflowY: "auto",
            }}>
              {/*contextData.username == user_id ||*/ friendsUser.map((f) => (
                <List sx={{ width: '100%', minWidth: 360, bgcolor: 'background.paper' }}>
                  <ListItem sx={{ width: '100%', minWidth: 360 }}>
                    <Avatar alt="username" sx={{ width: 65, height: 65 }} src={f.avatar} />
                    <p className="p_friendlist">{f.username}<br />{f.nickname}</p>
                    <EmojiEvents fontSize="large" />
                    <ListItemText /* primary={`#${f.position}`} */ primary={
                      <React.Fragment>
                        <Typography
                          // sx={{ display: 'inline' }}
                          // component="span"
                          // variant="body2"
                          // color="text.primary"
                          variant="h2"
                        >

                        </Typography>
                        {`#${f.position}`}
                      </React.Fragment>
                    } />
                    {user_id === contextData.username ? '' :
                      (f.friendship && f.friendship.friendship === 'pending') ?
                        <Pending_b_small /> : (f.friendship && f.friendship.friendship === 'friends') ? <div style={{ textAlign: 'center' }} ><CheckCircle /><p className="p_friendlist" /> FRIEND</div> : <Add_b_small />
                      /* <Remove_b_small /> : <Add_b_small />*/
                    }
                  </ListItem>
                  <Divider variant="middle" component="li" />
                </List>
              ))}
            </Box>
          </div>
        </Modal>
      </>
    )
  }

  /*****Per Lista amici pulsanti****/
  function Pending_b_small() {
    return (
      <div className="profile-card-inf__item">
        <Grid item xs={3}>
          <IconButton color="secondary" component="label"
            onClick={deleteRequestOrFriendship}>
            <HourglassTop fontSize="medium" />
          </IconButton>
          <div className="profile-card-inf__title"></div>
          <div style={{ textAlign: 'center' }} className="">PENDING</div>
        </Grid>
      </div>
    )
  }

  function Remove_b_small() {
    return (
      <div className="">
        <Grid item xs={3}>
          <button className="b_listfriends"
            onClick={deleteRequestOrFriendship}>
            <PersonRemove fontSize="small" /></button>
          <div className="profile-card-inf__title"></div>
          <div className="p_friendlist">REMOVE <br />FRIEND</div>
        </Grid>
      </div>
    )
  }

  function Add_b_small() {
    return (
      <div className="">
        <Grid item xs={3}>
          <IconButton sx={{ color: red[500] }} component="label"
            onClick={addFriend}>
            <AddCircle fontSize="medium" />
          </IconButton>
          <div className="profile-card-inf__title"></div>
          <div className="" style={{ textAlign: 'center' }}>ADD <br />FRIEND</div>
        </Grid>
      </div>
    )
  }
  /******* FINE *******/

  async function deleteRequestOrFriendship() {
    const API_DELETE_REQ_OR_FRIEND = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/deleteRequestOrFriendship`
    await fetch(API_DELETE_REQ_OR_FRIEND, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: contextData.username, profileUser: user_id })
    })
    setFriendship("nope");
  }

  function Pending_b() {
    return (
      <div className="profile-card-inf__item">
        <Grid item xs={3}>
          <button className="noselect"
            onClick={deleteRequestOrFriendship}>
            <HourglassTop fontSize="large" /></button>
          <div className="profile-card-inf__title"></div>
          <div className="profile-card-inf__txt">PENDING</div>
        </Grid>
      </div>
    )
  }

  function Remove_b() {
    return (
      <div className="profile-card-inf__item">
        <Grid item xs={3}>
          <button className="noselect"
            onClick={deleteRequestOrFriendship}>
            <PersonRemove fontSize="large" /></button>
          <div className="profile-card-inf__title"></div>
          <div className="profile-card-inf__txt">REMOVE <br />FRIEND</div>
        </Grid>
      </div>
    )
  }


  async function addFriend() {
    const API_ADDFRIEND = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/addFriend`
    await fetch(API_ADDFRIEND, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: contextData.username, profileUser: user_id })
    })
    setFriendship("pending");
  }

  function Add_b() {
    return (
      <div className="profile-card-inf__item">
        <Grid item xs={3}>
          <button className="noselect"
            onClick={addFriend}>
            <PersonAddAlt1 fontSize="large" /></button>
          <div className="profile-card-inf__title"></div>
          <div className="profile-card-inf__txt">ADD <br />FRIEND</div>
        </Grid>
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
        <div className="div_Notification">
          <h1 className="txt-request"><strong>{client.username}</strong> sent you<br /> a friend request</h1>
          <div className="column">
            <button id="accept" className="noselect" onClick={yepHandler} >
              <Done fontSize="large" />
            </button>
            <div className="profile-card-inf__title"></div>
            <div className="profile-card-inf__txt">ACCEPT</div>
          </div>

          <div className="column">
            <button className="noselect" onClick={deleteRequestOrFriendship}>
              <Close fontSize="large" />
            </button>
            <div className="profile-card-inf__title"></div>
            <div className="profile-card-inf__txt">DECLINE</div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="wrapper">
        <div className="profile-card">
          <div className="container-account">
            <div className="account_decoration">
              <img className="account_decor_top" src="/account_decoration_top.svg" alt="img_account" />
              <div className="txt_container_account">
                <h1 className="txt-account">Player<strong className="txt-account-strong"> {client.username}</strong>
                  <h2 className="score__txt">Score {client.points}</h2></h1>
                <h2 className="rank-txt">RANK <br /><h1 className="no-rank">No. 6</h1></h2>
              </div>
              <img className="account_decor_down" src="/account_decoration_down.svg" alt="img_account" />
            </div>
          </div>
          <div className="avatar__img-account">
            <img src={client.avatar}></img>
          </div>
          <div className="box-item">
            <div className="inf-account">
              <div className="friend-request">
                {user_id === contextData.username ? '' :
                  friendship === 'pending' ?
                    <Pending_b /> : friendship === 'toReply' ?
                      <SendNotification /> : friendship === 'friends' ?
                        <Remove_b /> : <Add_b />}
              </div>

              {/* MATCHES */}
              <div className="profile-card-inf__item">
                <Scoreboard client={client} />
              </div>
              {/* FRIENDS */}
              <div className="profile-card-inf__item">
                <Friends_b />
              </div>
              {/* BLOCK FRIEND */}
              <div className="profile-card-inf__item">
                <Grid item xs={3}>
                  <button className="noselect">
                    <NoAccounts fontSize="large" />
                  </button>
                  {/* <div className="profile-card-inf__title">85</div> */}
                  <div className="profile-card-inf__txt">BLOCK</div>
                </Grid>
              </div>
              {/* AWARD*/}
              <div className="profile-card-inf__item">
                <Grid item xs={3}>
                  <button className="noselect">
                    <EmojiEventsIcon fontSize="large" />
                  </button>
                  {/* <div className="profile-card-inf__title">85</div> */}
                  <div className="profile-card-inf__txt">AWARD</div>
                </Grid>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default Account;