/*
import {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {auth} from './utilities/auth'
import Header from './components/Header';
import Body from './components/Body';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInfo, setLoginInfo] = useState({un: "", ps: ""});
  const login = () => {
    auth.signInWithEmailAndPassword(loginInfo.un, loginInfo.ps).then((cred) => {
      setIsLoggedIn(true);
    })
  }
  return (
    <div className="App">
      <Header title={isLoggedIn}/>
      <Body loginButton={login} loginInfo={loginInfo} setLoginInfo={setLoginInfo}/>
    </div>

  );
}

export default App;  */

import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyD3vVFcVWnSGEJIHom2W_yAZotfFic00gM",
  authDomain: "mmo-authentication-db4a9.firebaseapp.com",
  databaseURL: "https://mmo-authentication-db4a9.firebaseio.com",
  projectId: "mmo-authentication-db4a9",
  storageBucket: "mmo-authentication-db4a9.appspot.com",
  messagingSenderId: "145746630929",
  appId: "1:145746630929:web:79a1ab0f63b648dfdb14b0",
  measurementId: "G-E1XY1FPC5X"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Adventures Online</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
      <button onClick={signInWithGoogle}>Sign in with Google</button>
  )

}
function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}
function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}



function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
