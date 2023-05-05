import '../styles/join.scss'
import { useState, useEffect } from 'react'
import { db, firebaseAuth } from '../firebase-config';
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";


/**
 * Represents a Join component.
 * @function Join
 * @returns {JSX.Element} A JSX element that renders the Join component.
 */
function Join(props) {
  const { setRoom } = props;
  const roomsRef = collection(db, "rooms");
  const [isAdmin, setIsAdmin] = useState(false);

  /**
   * An array state that stores the list of public rooms.
   * @type {[Object[] , Function]}
   */
  const [publicRooms, setPublicRooms] = useState([]);

  /**
   * A state that stores the room code.
   * @type {[undefined , Function]}
   */
  const [roomCode, setRoomCode] = useState(undefined);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = firebaseAuth.currentUser;
      if (user) {
        const uid = user.uid;
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", uid));
        const userDoc = await getDocs(q);
        const userData = userDoc.docs[0].data();
        setIsAdmin(userData.isAdmin);
      }
    }
    checkAdmin();
  }, [firebaseAuth.currentUser]);


useEffect(() => {
    /**
   * A Firestore query that gets all public rooms.
   * @type {query<DocumentData>}
   */
    let q = query(roomsRef, where("isPrivate", "==", false));

    if (isAdmin === true) {
      q = query(roomsRef);
    }

    /**
     * A listener function that updates the publicRooms state with the latest data from the Firestore query.
     * @type {function}
     */
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const rooms = [];
      querySnapshot.forEach((doc) => {
        rooms.push({ ...doc.data(), id: doc.id });
      });
      setPublicRooms(rooms);
    });

    // Unsubscribe from the listener when the component unmounts.
    return () => {
      unsubscribe();
    }
  }, [isAdmin]);

const handleJoin = (e) => {
    e.preventDefault();
    if (roomCode === undefined) {
      alert("Please enter a room code");
      return;
    }
    setRoom(roomCode);
}

  /**
   * A JSX element that renders the Join component.
   * @returns {JSX.Element}
   */
  return (
    <div>
      <div id="join-container">
        <h1>Join</h1>
        <div id="public-rooms">
          <h2>Public Rooms</h2>
          <ul>
            {publicRooms.map((room) => <li key={room.id}><button onClick={() => {setRoom(room.roomCode)}} style={{color: room.isPrivate ? 'red' : 'white', background: room.isPrivate && 'black', opacity: room.isPrivate && 0.7}}>{room.roomCode}</button></li>)}
          </ul>
        </div>
        <input type="text" placeholder="Enter Room Code" onChange={(e) => setRoomCode(e.target.value)} />
        <button onClick={(e) => handleJoin(e)}>Join</button>
      </div>
    </div>
  )
}

export default Join