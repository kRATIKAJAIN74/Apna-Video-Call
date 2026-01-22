import React, { useState, useRef } from 'react'
const server_url = "http://localhost:8080";

var connections = {};
const peerConfigConnections = {
  "iceServers": [
    {"urls": "stun:stun.l.google.com:19302"}
  ]
}
export default function VideoMeetComponent() {

  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable,setAudioAvailable] = useState(true);
  let [video, setVideo ] = useState();
  let [audio, setAudio] = useState();
  let [screen , SetScreen] = useState();
  let [showModal, setShowModal] = useState();
  let [screenAvailable, setScreenAvailable] = useState();
  let [message, setMessage] = useState("");
  let [messages,setMessages] = useState([]);
  let [newMessages, setNewMessages] = useState(0);
  


  return (
    <div>
      VideoMeetComponent
    </div>
  )
}
