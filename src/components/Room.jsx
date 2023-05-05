import "../styles/room.scss";

import { db } from "../firebase-config";
import {
  collection,
  where,
  orderBy,
  onSnapshot,
  query,
  doc,
  addDoc,
  getDocs,
  getDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import { firebaseAuth } from "../firebase-config";

/**
 * React component for the chat room page.
 *
 * @returns {JSX.Element} Chat room component.
 */
function Room(props) {
  const { roomCode, setCurrentRoom } = props;
  const roomsRef = collection(db, "rooms");

  /**
   * React hooks for retrieving and updating state.
   */
  const [messages, setMessages] = useState([]);
  const [formValue, setFormValue] = useState("");

  /**
   * Reference to the dummy div that is used to scroll to the bottom of the chat.
   */
  const dummy = useRef();

  const addSystemMessageToChatDiv = (message) => {
    const main = document.querySelector("main");
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add("received");
    const image = document.createElement("img");
    image.src =
      "https://bs-uploads.toptal.io/blackfish-uploads/components/skill_page/content/logo_file/logo/195453/sys_admin-3aa4b549a563e52289f833f0f8e602ad.png";
    const p = document.createElement("p");
    p.innerText = message;
    div.appendChild(image);
    div.appendChild(p);
    main.appendChild(div);
  };

  const handleSuggestionClick = (e) => {
    const suggestion = e.target.innerText;
    setFormValue(suggestion);
    document.querySelector(".suggestions").style.display = "none";
    const form = document.querySelector("form");
    form.style.height = "10vh";
  };

  const autoSuggestChatCommands = (e) => {
    const commands = ["/clear", "/help", "/terminate", "/code"];

    const input = e.target.value;

    if (input.charAt(0) !== "/") {
      document.querySelector(".suggestions").style.display = "none";
      const form = document.querySelector("form");
      form.style.height = "10vh";
      return;
    }

    const suggestions = commands.filter((command) => command.startsWith(input));

    const suggestionsDiv = document.querySelector(".suggestions");

    suggestionsDiv.innerHTML = "";

    suggestions.forEach((suggestion) => {
      const div = document.createElement("div");
      div.classList.add("suggestion");
      div.innerText = suggestion;
      suggestionsDiv.appendChild(div);
      div.addEventListener("click", handleSuggestionClick);
    });

    if (suggestions.length === 0) {
      const form = document.querySelector("form");
      form.style.height = "10vh";
      suggestionsDiv.style.display = "none";
    } else {
      const form = document.querySelector("form");
      form.style.height = "20vh";
      suggestionsDiv.style.display = "flex";
    }
  };

  const handleFormChange = (e) => {
    setFormValue(e.target.value);
    autoSuggestChatCommands(e);
  };

  /**
   * Function to retrieve messages and room information from Firebase.
   */
  useEffect(() => {
    // Retrieve messages from the room.
    const messagesRef = collection(db, `rooms/${roomCode}/messages`);
    const q = query(messagesRef, orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Function to check if the current user is the host of the room.
   *
   * @returns {boolean} True if the current user is the host, false otherwise.
   */
  const checkIfHost = async () => {
    const room = await getDocs(roomsRef);
    const roomData = room.docs[0].data();

    return firebaseAuth.currentUser.uid === roomData.host;
  };

  /**
   * Function to handle chat commands.
   *
   * @param {string} message The chat message to check for commands.
   *
   * @returns {boolean} True if the message was a chat command, false otherwise.
   */
  const chatCommands = (message) => {
    const commands = ["/clear", "/help", "/terminate", "/code"];

    if (!commands.includes(message)) {
      return false;
    }

    const clearChat = async () => {
      const messagesRef = collection(db, `rooms/${roomCode}/messages`);
      const messages = await getDocs(messagesRef);
      messages.forEach((message) => {
        deleteDoc(doc(messagesRef, message.id));
      });

      console.log("chat cleared");
    };

    const terminateRoom = async () => {
      const roomRef = collection(db, "rooms");
      const room = await getDoc(
        query(roomRef, where("roomCode", "==", roomCode))
      );

      try {
        deleteDoc(doc(roomRef, room));
        addSystemMessageToChatDiv(
          "Room terminated! You may now leave the room."
        );
      } catch (error) {
        console.log(error);
        addSystemMessageToChatDiv(
          "There was an error terminating the room. Please try again later."
        );
      }
    };

    if (message.charAt(0) !== "/") {
      return;
    }

    const isHost = checkIfHost();

    switch (message) {
      case "/clear":
        if (!isHost) {
          addSystemMessageToChatDiv("Only the host can clear the chat!");
          break;
        }
        clearChat();
        break;

      case "/help":
        addSystemMessageToChatDiv(
          "Available commands: /clear, /help, /terminate, /code"
        );
        const commandDescriptions = {
          "/clear": "Clears the chat",
          "/help": "Displays these messages",
          "/terminate": "Terminates the room",
          "/code": "Displays the room code",
        };
        for (const command in commandDescriptions) {
          addSystemMessageToChatDiv(
            `${command}: ${commandDescriptions[command]}`
          );
        }
        break;

      case "/terminate":
        if (!isHost) {
          addSystemMessageToChatDiv("Only the host can terminate the room!");
          break;
        }
        terminateRoom();
        break;

      case "/code":
        addSystemMessageToChatDiv(`Room code: ${roomCode}`);
        break;

      default:
        break;
    }

    return true;
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    const wasChatCommand = chatCommands(formValue);
    /**
     * Back in the sendMessage function, if wasChatCommand is true, meaning a chat command was executed, the function ends by setting the formValue state to an empty string and returning nothing.
     */

    if (wasChatCommand === true) {
      setFormValue("");
      document.querySelector(".suggestions").style.display = "none";
      const form = document.querySelector("form");
      form.style.height = "10vh";
      return;
    }

    if (formValue.replace(/\s/g, "") === "") {
      setFormValue("");
      alert("Message cannot be empty! Please type a message.");
      return;
    }

    const room = await getDocs(query(roomsRef, where("roomCode", "==", roomCode)));

    if (room.docs.length === 0) {
      alert("Room does not exist or it has been terminated!");
      setCurrentRoom(undefined);
    }

    /**
     * Otherwise, if formValue is not an empty string, the function creates a new message in the messagesRef collection by calling setDoc and passing it an object containing the message's text, creation time, user ID, and photo URL.
     */
    const messagesRef = collection(db, "rooms", roomCode, "messages");

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid: firebaseAuth.currentUser.uid,
      photoURL: firebaseAuth.currentUser.photoURL,
    });
    /**
     *Finally, the formValue state is set to an empty string, and the dummy element is scrolled into view, which ensures that the latest message is always visible to the user.
     */
    setFormValue("");

    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="room">
      <main>
        {messages &&
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <div className="suggestions"></div>

        <div className="inputs">
          <button
            type="button"
            onClick={() => {
              setCurrentRoom(undefined);
            }}
          >
            Leave Room
          </button>

          <input
            type="text"
            placeholder="Type a message"
            value={formValue}
            onChange={(e) => handleFormChange(e)}
          />
          <button type="submit">Send</button>
        </div>
      </form>
    </div>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === firebaseAuth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  );
}

export default Room;
