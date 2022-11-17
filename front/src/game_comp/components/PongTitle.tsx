import React from 'react'
import './PongTitle.css'


export function PongTitle() {
  return (
    <div className='title_container'>
        <h1 className='glowing_page_title'>
            <span className='P'>P</span>
            <span className='O'>O</span>
            <span className='N'>N</span>
            <span className='G'>G</span>
        </h1>
    </div>
  )
}