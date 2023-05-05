import { useState, } from 'react'

import Auth from './components/Auth'
import Nav from './components/Nav'
import Room from './components/Room'

import Home from './components/Home'

import Cookies from 'universal-cookie';

const cookies = new Cookies();

function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token") ? true : false)
  const [room, setRoom] = useState(undefined)


  if (!isAuth) {
    return (
      <div>
        <Nav isAuth={isAuth} setAuth={setIsAuth} setRoom={setRoom} roomCode={room}/>
        <Auth setAuth={setIsAuth}/>
      </div>
    )
  }

  if (room) {
    return (
      <div>
        <Nav isAuth={isAuth} setAuth={setIsAuth} setRoom={setRoom} roomCode={room}/>
        <Room roomCode={room} setCurrentRoom={setRoom}/>
      </div>
    )
  }

  return (
    <div>
      <Nav isAuth={isAuth} setAuth={setIsAuth} setRoom={setRoom} roomCode={room}/>
      <Home setRoom={setRoom}/>
    </div>
  )
}

export default App