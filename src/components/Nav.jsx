/**
This module exports a React component called Nav, which represents a navigation bar
for a chat application. It displays the application name and a logout button if the user
is authenticated. If the user is not authenticated, it redirects them to the login page.
@module Nav
*/

import '../styles/nav.scss'
import { signOut } from "firebase/auth";
import { firebaseAuth } from "../firebase-config";
import Cookies from 'universal-cookie';

const cookies = new Cookies();

/**
A React functional component that renders a navigation bar for a chat application.
@function Nav
@returns {JSX.Element} A JSX element that represents the navigation bar.
*/

function Nav(props) {
  const { isAuth, setAuth, setRoom, roomCode } = props;

/**
Signs out the user.
@function signUserOut
@returns {void}
*/

  const signUserOut = async () => {
    await signOut(firebaseAuth);
    cookies.remove("auth-token");
    setAuth(false);
    setRoom(undefined);
  };

  const copyRoomCodeToClipboard = () => {
    navigator.clipboard.writeText(roomCode);
    alert("Room code copied to clipboard");
  }

  return (
    <div id='nav-bar-container'>
      <nav>
        <div id='nav-bar-container-left'>
          {roomCode ? <h1 onClick={() => copyRoomCodeToClipboard()}>Chat App  room: {roomCode}</h1> : <h1>Chat App</h1>}
        </div>
        <div id='nav-bar-container-center'>
        </div>
        <div id='nav-bar-container-right'>
          {isAuth && <button onClick={signUserOut}>Logout</button>}
          </div>

        </nav>
    </div>
  )
}

export default Nav
