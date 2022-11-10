import React from 'react';

function Logout() {
    const API_URL = `http://${process.env.REACT_APP_IP_ADDR}:3001/logout`

    fetch(API_URL, {
        credentials: 'include',
    }).then(response => {
        window.location.href = "/"
    }).catch(error => {
        console.error('Error:', error);
    });

    return (
        <div className='Logout'></div>
    );
}

export default Logout;