import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

export { default as Logout } from "./Logout";
export { default as Home } from "./Home";
export { default as About } from "./About";
export { default as Game } from "./Game";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  //<React.StrictMode> // know y but this lines]
  <App />
  //</React.StrictMode> //[make the pages load twice]
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(//console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
