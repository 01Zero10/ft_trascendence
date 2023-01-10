import React, { useContext, useEffect, useLayoutEffect } from 'react';
import './Home.css';
import { Link } from "react-router-dom";
import { Avatar, Box, IconButton, Tooltip } from '@mui/material';
import { Student } from './App';
import Holder from './Holder';
import Navigation from './Navigation';

/* NavLink 
mettere il wrapper (componente) così rimane la Navbar ma la pagina cambia */

// const background = document.getElementById('BackGround');
// background = addEventListener('move', handleMove)

// const function handleMove() {
//
// }
// $(background).mousemove(function(event) {
//   windowWidth = $(window).width();
//   windowHeight = $(window).height();

//   mouseXpercentage = Math.round(event.pageX / windowWidth * 100);
//   mouseYpercentage = Math.round(event.pageY / windowHeight * 100);

//   $('.radial-gradient').css('background', 'radial-gradient(at ' + mouseXpercentage + '% ' + mouseYpercentage + '%, #3498db, #9b59b6)');
// });


function Home() {
  const contextData = useContext(Student);

  return (
    <>
      <Navigation />
      <div className='homeContainer'>

        {/* <div className='radial-gradient'> */}
        <div className='Title'>
          <h1 className='h1_title'>FT_TRANSCENDENCE</h1>
          <h3 className='h3_title'>Progetto realizzato dal team: {process.env.REACT_APP_IP_ADDR} </h3>
          <Link to="/game">
            <button className='myButton'>Play Now</button>
          </Link>

          {/* <ul>
          {data.hits.map((item:any) => (
            <li key={item.username}>
              <a href={item.url}>{item.title}</a>
            </li>
          ))}
        </ul>  */}

        </div>
        {/*       <div className='Chip'>
          <img src="chip.svg" alt="img" />
        </div> */}
        <Holder />
        {/* </div> */}
      </div>
      <div className='_prv_'></div>
    </>
  );

}

export default Home;

