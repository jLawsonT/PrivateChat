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
  const [chatroomList, setChatroomList] = useState([]);
  const chatroomRef = firestore.collection('chatrooms');
  const query = chatroomRef;

  const [chatrooms] = useCollectionData(query, { idField: 'id' });

  const messagesRef = firestore.collection('messages');
  const query2 = messagesRef.orderBy('createdAt');
  const [messages] = useCollectionData(query2, { idField: 'id' });

  return (
    <div className="App">
      <header>
        <h1>Adventures Online</h1>
        <SignOut />
      </header>
      <div className="mainContent">
        <div className="sidebar">
          {user ? <Sidebar chatrooms={chatrooms} chatroomList={chatroomList} setChatroomList={setChatroomList} /> : null}
        </div>
        <div className="chatroom">
          {user ? <ChatRoom messages={messages} chatroomList={chatroomList} setChatroomList={setChatroomList} /> : <SignIn />}
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
    <button id="signInBtn" onClick={signInWithGoogle}>Sign in with Google</button>
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
    if (props.chatrooms) {
      let temp = JSON.parse(JSON.stringify(props.chatroomList));
      props.chatrooms.forEach(room => {
        if (room.user1 === firebase.auth().currentUser.email) {
          if (temp.filter(item => item.otherUser === room.user2).length === 0) {
            temp.push({ otherUser: room.user2, open: false, messages: [] })
          }
        } else if (room.user2 === firebase.auth().currentUser.email) {
          if (temp.filter(item => item.otherUser === room.user1).length === 0) {
            temp.push({ otherUser: room.user1, open: false, messages: [] })
          }
        }
      })
      props.setChatroomList(temp);
    }
  }, [props.chatrooms]);



  const handleEmailKey = async (event) => {
    if (event.key === 'Enter') {
      let chatroomFound = false;
      const chatroomRef = firestore.collection('chatrooms');
      const snapshot = await chatroomRef.where('user2', '==', firebase.auth().currentUser.email).get().then((query) => {
        if (!query.empty) {
          query.forEach(doc => {
            if (doc.data().user1 === inputEmail) {
              chatroomFound = true;
            }
          })
        }
      });
      const snapshot2 = await chatroomRef.where('user1', '==', firebase.auth().currentUser.email).get().then((query) => {
        if (!query.empty) {
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

  const buttonSelect = (event, otherUser) => {
    let temp = JSON.parse(JSON.stringify(props.chatroomList))
    temp.forEach(item => {
      if (item.otherUser === otherUser) {
        item.open = true;
      } else {
        item.open = false;
      }
    })
    props.setChatroomList(temp);
  }

  return (
    <div className="sidebarContent">
      <h1>Chat Rooms</h1>
      <input id="emailInput" type="text" value={inputEmail} onChange={handleEmailChange} onKeyDown={handleEmailKey} />
      {props.chatroomList && props.chatroomList.map(item => {
        const selected = item.open ? 'selected' : ''
        return (
          <div>
            <button type="button" className={`chatroombutton ${selected}`} onClick={(event) => buttonSelect(event, item.otherUser)}> {item.otherUser} </button>
          </div>
        )
      })}
    </div>
  )
}

function ChatRoom(props) {

  const messagesRef = firestore.collection('messages');
  const dummy = useRef();

  useEffect(() => {
    if (props.messages) {
      let temp = JSON.parse(JSON.stringify(props.chatroomList));

      props.messages.forEach(message => {
        if (message.to === firebase.auth().currentUser.email) {
          let index = temp.findIndex(element => element.otherUser === message.from);
          let isIn = false;
          temp[index].messages.forEach(item => {
            if (item.id === message.id) {
              isIn = true;
            }
          })
          if (!isIn) {
            temp[index].messages.push(message);
          }
        } else if (message.from === firebase.auth().currentUser.email) {
          let index = temp.findIndex(element => element.otherUser === message.to);
          let isIn = false;
          temp[index].messages.forEach(item => {
            if (item.id === message.id) {
              isIn = true;
            }
          })
          if (!isIn) {
            temp[index].messages.push(message);
          }
        }
      })
      props.setChatroomList(temp);
    }
  }, [props.messages]);


  const [formValue, setFormValue] = useState('');

  const isOpen = props.chatroomList.filter(item => item.open).length > 0;
  let otherUser;
  let openIndex;

  if (isOpen) {
    otherUser = props.chatroomList.filter(item => item.open)[0].otherUser;
    openIndex = props.chatroomList.findIndex(element => element.otherUser === otherUser)
  }

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!isOpen)
      return;

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      to: otherUser,
      from: firebase.auth().currentUser.email
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main id="mainContent">

      {openIndex > -1 && props.chatroomList[openIndex].messages && props.chatroomList[openIndex].messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input id="messageInput" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="New Message" />

      <button type="submit" disabled={!formValue && isOpen}>⬆️</button>

    </form>
  </>)
}

function ChatMessage(props) {
  const { text, from } = props.message;

  const messageClass = from === firebase.auth().currentUser.email ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <p>{text}</p>
    </div>
  </>)
}


export default App;
