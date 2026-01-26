import React, { useEffect, useRef, useState } from "react";
import "../styles/videoComponent.css";
import { TextField, Button } from "@mui/material";

const server_url = "http://localhost:8080";

const peerConfigConnections = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

export default function VideoMeetComponent() {
  const localVideoRef = useRef(null);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);

  const [video, setVideo] = useState(false);
  const [audio, setAudio] = useState(false);

  const [screenAvailable, setScreenAvailable] = useState(false);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  /* ===================== PERMISSIONS ===================== */

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true
      });
      setVideoAvailable(!!videoPermission);

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      setAudioAvailable(!!audioPermission);

      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      window.localStream = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Permission error:", err);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  /* ===================== MEDIA CONTROL ===================== */

  const getUserMedia = async () => {
    if (video || audio) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video,
        audio: audio
      });

      window.localStream = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } else {
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  };

  useEffect(() => {
    getUserMedia();
  }, [video, audio]);

  /* ===================== CONNECT ===================== */

  const connect = () => {
    setAskForUsername(false);
    setVideo(videoAvailable);
    setAudio(audioAvailable);
  };

  /* ===================== UI ===================== */

  return (
    <div className="video-container">
      {askForUsername ? (
        <div className="lobby">
          <h2>Enter Lobby</h2>

          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />

          <Button
            variant="contained"
            style={{ marginTop: "10px" }}
            onClick={connect}
          >
            Connect
          </Button>

          <div className="video-preview">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{ width: "300px", marginTop: "15px" }}
            />
          </div>
        </div>
      ) : (
        <h3>Connected as {username}</h3>
      )}
    </div>
  );
}
