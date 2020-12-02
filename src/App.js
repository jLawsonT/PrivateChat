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
import { useAsync } from 'react-async';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
//import {ReactSVG} from 'react-svg';
//import Logo from './treelogo2.svg'

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

const loadChatrooms = async () => {

}

function App() {

  const [user] = useAuthState(auth);
  const [chatroomList, setChatroomList] = useState();

  return (
    <div className="App">
      <header>
        <h1>Adventures Online</h1>
        <SignOut />
      </header>
      <div className="mainContent">
        <div className="sidebar">
          {user ? <Sidebar chatroomList={chatroomList} setChatroomList={setChatroomList} /> : null}
        </div>
        <div className="chatroom">
          {user ? <ChatRoom /> : <SignIn />}
        </div>
      </div>
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

function Sidebar(props) {
  const [inputEmail, setInputEmail] = useState('');
  const handleEmailChange = (event) => {
    setInputEmail(event.target.value);
  }

  useEffect(() => {
    const chatroomRef = firestore.collection('chatrooms');
    let tempList = [];
    chatroomRef.where('user2', '==', firebase.auth().currentUser.email)
      .get()
      .then((query) => {
        if (!query.empty) {
          query.forEach(doc => {
            console.log(doc.data())
            if (doc.data().user1 === firebase.auth().currentUser.email) {
              tempList.push({ otherUser: doc.data().user2, open: false })
            } else {
              tempList.push({ otherUser: doc.data().user1, open: false })
            }
          })
        }
        chatroomRef.where('user1', '==', firebase.auth().currentUser.email)
          .get()
          .then((query) => {
            if (!query.empty) {
              query.forEach(doc => {
                console.log(doc.data())
                if (doc.data().user1 === firebase.auth().currentUser.email) {
                  tempList.push({ otherUser: doc.data().user2, open: false })
                } else {
                  tempList.push({ otherUser: doc.data().user1, open: false })
                }
              })
            }

            console.log(tempList)
            props.setChatroomList(tempList);
          })
      });
  }, []);

  const handleEmailKey = async (event) => {
    if (event.key === 'Enter') {
      let chatroomFound = false;
      const chatroomRef = firestore.collection('chatrooms');
      const snapshot = await chatroomRef.where('user2', '==', firebase.auth().currentUser.email).get().then((query) => {
        if (!query.empty) {
          console.log(query)
          query.forEach(doc => {
            if (doc.data().user1 === inputEmail) {
              chatroomFound = true;
            }
          })
        }
      });
      const snapshot2 = await chatroomRef.where('user1', '==', firebase.auth().currentUser.email).get().then((query) => {
        if (!query.empty) {
          console.log(query)
          query.forEach(doc => {
            if (doc.data().user2 === inputEmail) {
              chatroomFound = true;
            }
          })
        }
      });
      if (!chatroomFound) {
        await firestore.collection('chatrooms').add({
          user1: inputEmail,
          user2: firebase.auth().currentUser.email
        })
      }
      setInputEmail('');
      event.target.blur();
    }
  }

  return (
    <div className="sidebarContent">
      <h1>Chat Rooms</h1>
      <input id="emailInput" type="text" value={inputEmail} onChange={handleEmailChange} onKeyDown={handleEmailKey} />
      {props.chatroomList && props.chatroomList.map(item => {
        return (
        <h1>
          {
            item.otherUser
          }

        </h1>)
      })}
    </div>
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
    <main id="mainContent">

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input id="messageInput" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="New Message" />

      <button type="submit" disabled={!formValue}>⬆️</button>

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
