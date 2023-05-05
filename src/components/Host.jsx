import '../styles/host.scss'
import { useState } from 'react'
import { collection, query, addDoc, where } from "firebase/firestore";
import { firebaseAuth, db } from "../firebase-config";

/**
 * Host component.
 *
 * @returns {JSX.Element} Host component.
 */
function Host(props) {

    const [roomType, setRoomType] = useState('private');
    const { setRoom } = props;

    const roomsRef = collection(db, "rooms");

    /**
     * Generates a random 6-character room code.
     *
     * @returns {string} A random 6-character string.
     */
    const generateRoomCode = () => {
        let code = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }

    /**
     * Checks if a room with the given code already exists in the database.
     *
     * @param {string} code - The room code to check.
     * @returns {Promise<boolean>} True if a room with the given code already exists, false otherwise.
     */
    const checkRoomCode =  (code) => {
        const queryRooms = query(roomsRef, where("roomCode", "==", code));
        if (queryRooms === undefined) {
            return false;
        }else {
            return true;
        }
    }

    /**
     * Handles the form submission to host a new room.
     *
     * @param {Event} e - The form submission event.
     */
    const handleHost = async (e) => {
        e.preventDefault();
        let code = generateRoomCode();
        while (checkRoomCode(code) === true){
            code = generateRoomCode();
        }

        await addDoc(roomsRef, {
            roomCode: code,
            isPrivate: roomType === 'private' ? true : false,
            host: firebaseAuth.currentUser.uid,
        });

        setRoom(code);
    }

    return (
        <div>
            <div id="host-container">
                <h1>Host</h1>
                <form onSubmit={(e) => handleHost(e)}>
                    <button>Host a room</button>
                    <div id='host-options'>
                        <input defaultChecked={true} type="radio" id="private" name="room" value="private" onChange={(e) => setRoomType(e.target.value)}/>
                        <label htmlFor="private">Private</label>
                        <input type="radio" id="public" name="room" value="public" onChange={(e) => setRoomType(e.target.value)}/>
                        <label htmlFor="public">Public</label>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Host
