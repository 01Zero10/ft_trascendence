import { Logout, Settings } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { AppBar, Divider, Drawer, IconButton, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, styled, SvgIcon, Toolbar, Tooltip, Typography } from '@mui/material';
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navigation.css';
import { Student } from './App';
import { Avatar, Box, List } from '@mantine/core';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationBell from './NotificationBell';
import { io, Socket } from 'socket.io-client';

<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,600,1,200" />

interface userNavBar {
  username: string,
  nickname: string,
  avatar: string,
}

const ListSearch = () => {

  const contextData = useContext(Student)

  const [options, setOptions] = React.useState<userNavBar[]>([])

  const setSearch_initial_value = {
    query: '',
    list: [] as unknown as userNavBar[],
  }
  const [search, setSearch] = React.useState(setSearch_initial_value)

  useEffect(() => {
    async function getUserNavBar() {
      let response = await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/chat/getuod`);
      let data = await response.json();
      data.forEach((element: any) => {
        let dropDown: userNavBar = { username: element.username, nickname: element.nickname, avatar: element.avatar }
        if (!options[element.username])
          options.push(dropDown);
      })
    }
    getUserNavBar();
    //console.log(options);
  }, []) //[] ?


  const resetValue = (e: any)=> {
    e.target.value = "";
    setSearch(setSearch_initial_value)
  }

  const searchChange = (e: { target: { value: string; }; }) => {
    const result = options.filter(options => {
      if (options.username === contextData.username) return false
      if (e.target.value === "") return options
      return options.username.toLowerCase().includes(e.target.value.toLowerCase())
    })

    setSearch({
      query: e.target.value,
      list: result
    })
  }



  return (
    <div className='filter-search-bar'>
      <div className="search-box">
        <button className="btn-search"><i className="fas fa-search"><SearchIcon sx={{ fontSize: 30, color: 'linear-gradient(to right bottom, #FD297B, #FF5864, #FF655B' }} /></i></button>
        <input className='input-search' placeholder="Type an username" type="text" value={search.query} onChange={searchChange} />
        <ul className="filter-search-results" >
          {(search.query === '' ? "" : !search.list.length ? <li className="filter-search-results-item"><h3 className='err_msg'>Your query did not return any results</h3></li> : search.list.map(option => {
            return (
              // <ListItemAvatar key={option.username}>
                <Link to={`/users/${option.username}`}>
                  <div className="filter-search-results-item" style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
                  <img className='avatar_search' alt="user_avatar" src={option.avatar} />
                  <h5 style={{ fontWeight: 'normal'}}>{option.username}</h5>  
                  </div>
                  
                  {/* <li className="filter-search-results-item">{option.username}
                    <img className='avatar_search' alt="user_avatar" src={option.avatar} />
                  </li> */}
                </Link>
             // </ListItemAvatar>
            )
          }))}
        </ul>
      </div>
    </div>
  );
}

function Navigation() {

  const contextData = useContext(Student)
  const [socket, setSocket] = useState<Socket | null>(null);

  async function updateChannelUsersList() {
    const API_URL_UPDATE_CHANNEL_USERS_LIST = `http://${process.env.REACT_APP_IP_ADDR}:3001/chat/updateChannelUsersList`;
    await fetch(API_URL_UPDATE_CHANNEL_USERS_LIST, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
  }

  useLayoutEffect(() => {
      socket?.on('updateAllChannelList', async () => {
        console.log('qualcuno ha lasciato');
        updateChannelUsersList();
      })
  }, [socket])

  useLayoutEffect(() => {
      const newSocket = io(`http://${process.env.REACT_APP_IP_ADDR}:3001`, { query: { userID: String(contextData.id) } });
      newSocket.on('connect', () => {
          setSocket(newSocket);
          updateChannelUsersList();
      })
      return () => {
        //updateChannelUsersList();
        socket?.disconnect();
      }
  }, [contextData.id]);
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //responsive
  const navItems = ['HOME', 'GAME', 'LEADERBOARD', 'CHAT'];

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Divider />
      <List>
        <NavLink to="/home">
          <ListItem disablePadding>
            <ListItemButton sx={{ textAlign: 'center', color: '#000' }}>
              <ListItemText primary='HOME' />
            </ListItemButton>
          </ListItem>
        </NavLink>

        <NavLink to="/game">
          <ListItem disablePadding>
            <ListItemButton sx={{ textAlign: 'center', color: '#000' }}>
              <ListItemText primary='GAME' />
            </ListItemButton>
          </ListItem>
        </NavLink>

        <NavLink to="/leaderboard">
          <ListItem disablePadding>
            <ListItemButton sx={{ textAlign: 'center', color: '#000' }}>
              <ListItemText primary='LEADERBOARD' />
            </ListItemButton>
          </ListItem>
        </NavLink>

        <NavLink to="/chat">
          <ListItem disablePadding>
            <ListItemButton sx={{ textAlign: 'center', color: '#000' }}>
              <ListItemText primary='CHAT' />
            </ListItemButton>
          </ListItem>
        </NavLink>
      </List>
    </Box>
  );

  const drawerWidth = 240;

  const header = styled(Toolbar)(({ theme }) => ({
    position: 'fixed',
    display: 'flex',
    /* flex-direction: row; */
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignContent: 'center',
    bgcolor: '#fff',
    width: '100%',
  }))
  return (
    <>
      <AppBar position='absolute' sx={{boxShadow:'none' ,bgcolor: 'transparent', color: '#fff', width: '100%', paddingLeft: '32px', paddingRight: '32px', zIndex:"50" }} component='nav'>
        <Toolbar>
          <NotificationBell socket={socket} sx={{ right: "20%" }} />
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon sx={{ color: '#fff' }} />
          </IconButton>
          <Typography
            component="div"
            sx={{ flexGrow: 2, alignItems: 'center', width: '100%', justifyContent: 'flex-end', alignContent: 'center', display: { xs: 'none', md: 'flex' } }}
          >
            <div className='navigation'>

              <NavLink className="nav-link" to="/home">
                HOME
              </NavLink>
              <NavLink className="nav-link" to="/game">
                GAME
              </NavLink>
              <NavLink className="nav-link" to="/leaderboard">
                LEADERBOARD
              </NavLink>
              <NavLink className="nav-link" to="/chat">
                CHAT
              </NavLink>
              <div className='indicator'></div>

            </div>
          </Typography>
          <div >

          </div>
          <div className='search-avatar'>
            <ListSearch />
            <Box sx={{ flexGrow: 0 }}>

              <Tooltip title="Open settings">

                <IconButton
                  onClick={handleClick}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <Avatar alt="avatar" src={contextData.avatar} radius="xl" sx={{ width: 55, height: 55 }}></Avatar>
                </IconButton>

              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                id="menu-appbar"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                keepMounted
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Link to={`/users/${contextData.username}`}>
                  <MenuItem sx={{ color: '#000' }}>
                    <Avatar src={contextData.avatar} radius="xl" size="sm" sx={{ marginRight: "5%" }} />My account
                    {/* <Avatar src={element.avatar}/> My account */}
                  </MenuItem>
                </Link>
                <Divider />
                <Link to={`/users/settings`}>
                  <MenuItem sx={{ color: '#000' }}>
                    <ListItemIcon>
                      <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                  </MenuItem>
                </Link>
                <Link to={`/logout`}>
                  <MenuItem sx={{ color: '#000' }}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Link>
              </Menu>
            </Box>
          </div>
          {/* </div> */}
        </Toolbar>
        {/* </div> */}
      </AppBar>

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{

            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
}

export default Navigation;