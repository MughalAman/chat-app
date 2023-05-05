import "../styles/signin.scss";
import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword} from "firebase/auth";
import { firebaseAuth, googleAuthProvider } from "../firebase-config";
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function SignUpView(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { setLogin, setIsAuth } = props;

        /**
     * Handles signup with email and password.
     * @async
     * @returns {Promise<void>} A promise that resolves when signup is successful.
     */
        const handleSignupWithEmail = async () => {
            if (email.length === 0) {
                alert("Email cannot be empty");
                return;
            }

            if (password.length < 8) {
                alert("Password must be at least 8 characters long");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
            }

            try {
                const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
                cookies.set("auth-token", result.user.refreshToken, {sameSite: 'strict'})
                setIsAuth(true);
            } catch (error) {
                console.log(error);
            }
        };

        /**
         * Handles signup with Google.
         * @async
         * @returns {Promise<void>} A promise that resolves when signup is successful.
         */
        const handleSignupWithGoogle = async () => {
            try {
                const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
                cookies.set("auth-token", result.user.refreshToken, {sameSite: 'strict'})
                setIsAuth(true);
            } catch (error) {
                console.log(error);
            }
        };

    return (
        <section>
        <div className="auth-container">
            <h1>Signup</h1>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
            />
            <div className="Buttons">
                <button onClick={handleSignupWithEmail} className="auth-btn">Signup with Email</button>
                <span className="auth-span">or</span>
                <button onClick={handleSignupWithGoogle} className="auth-btn">Signup with Google</button>
                <span className="auth-span">
                    Already have an account? <a style={{color:'white', textDecorationLine:'underline'}} onClick={() => setLogin(true)}>Login</a>
                </span>
            </div>
        </div>
    </section>
    )
}

function LoginView(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { setLogin, setIsAuth } = props;

    /**
     * Handles login with email and password.
     * @async
     * @returns {Promise<void>} A promise that resolves when login is successful.
     *  */
    const handleLoginWithEmail = async () => {
        if (password === "" || email === "") {
            alert("email or password is empty");
            return;
        }

        try {
           const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
           cookies.set("auth-token", result.user.refreshToken, {sameSite: 'strict'})
           setIsAuth(true);
        } catch (error) {
            console.log(error);
        }
    };

    /**
     * Handles login with Google.
     * @returns {Promise<void>} A promise that resolves when login is successful.
     */
    const handleLoginWithGoogle =  async () => {
        try {
            const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
            cookies.set("auth-token", result.user.refreshToken, {sameSite: 'strict'})
            setIsAuth(true);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <section>
        <div className="auth-container">
            <h1>Login</h1>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
            />
            <div className="Buttons">
                <button onClick={handleLoginWithEmail} className="auth-btn">Login with Email</button>
                <span className="auth-span">or</span>
                <button onClick={handleLoginWithGoogle} className="auth-btn">Login with Google</button>
                <span className="auth-span">
                    Don't have an account? <a style={{color:'white', textDecorationLine:'underline'}} onClick={() => setLogin(false)}>Signup</a>
                </span>
            </div>
        </div>
    </section>
    )
}

function Auth(props) {
    const [isLogin, setIsLogin] = useState(true);
    const { setAuth } = props;
  return (
    <div>
        {isLogin ? <LoginView setLogin={setIsLogin} setIsAuth={setAuth} /> : <SignUpView setLogin={setIsLogin} setIsAuth={setAuth}/>}
    </div>
  )
}

export default Auth