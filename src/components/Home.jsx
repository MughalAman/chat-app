import Join from './Join';
import Host from './Host';

import {
    collection,
    where,
    query,
    addDoc,
    getDocs
  } from "firebase/firestore";

  import { useEffect } from "react";
  import { db, firebaseAuth } from "../firebase-config";
/**
 * Home component that renders the Join and Host components.
 * @return {JSX.Element} JSX element containing the Join and Host components.
 */
function Home(props) {
    const { setRoom } = props;

    useEffect(() => {
        // check if user is in users collection if not add them with value isAdmin = false and uid = user.uid
        const checkUser = async () => {
            const user = firebaseAuth.currentUser;
            if (user) {
                const uid = user.uid;
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("uid", "==", uid));
                const userDoc = await getDocs(q);
                if (userDoc.empty) {
                    await addDoc(usersRef, {
                        uid: uid,
                        isAdmin: false,
                    });
                }
            }
        };
        checkUser();
    }, [firebaseAuth.currentUser]);

    return (
        <div id="home-container"><Join setRoom={setRoom} /><Host setRoom={setRoom}/></div>
    )
}

export default Home