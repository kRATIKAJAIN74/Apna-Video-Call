import React, { useEffect, useRef, useState } from "react";
import { TextField, Button, IconButton, Badge } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";

import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import ChatIcon from "@mui/icons-material/Chat";

import { Navigate, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import styles from "../styles/videoComponent.module.css";
import lobbyStyles from "../styles/lobby.module.css";
// const server_url = "http://localhost:8080"; // for local
const server_url = process.env.REACT_APP_SOCKET_URL;
 // for prod

const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export default function VideoMeetComponent() {
  const { meetingId } = useParams();
  const connectionsRef = useRef({});
  var socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();

  let [screen, setScreen] = useState();

  let [showModal, setModal] = useState(true);

  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);

  let [message, setMessage] = useState();

  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }
      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getPermissions();
  }, []);

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    for (let id in connectionsRef.current) {
      if (id === socketIdRef.current) continue;
      window.localStream.getTracks().forEach((track) => {
        connectionsRef.current[id].addTrack(track, window.localStream);
      });
      connectionsRef.current[id]
        .createOffer()
        .then((description) => {
          connectionsRef.current[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "signal",
                id,
                JSON.stringify({ sdp: connectionsRef.current[id].localDescription }),
              );
            })
            .catch((e) => console.log(e));
        })
        .catch((e) => console.log(e));
    }
    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);
          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          //Todo BlackSilence
          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connectionsRef.current) {
            window.localStream.getTracks().forEach((track) => {
              connectionsRef.current[id].addTrack(track, window.localStream);
            });
            connectionsRef.current[id].createOffer().then((description) => {
              connectionsRef.current[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connectionsRef.current[id].localDescription }),
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }),
    );
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };
  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess) // TODO: getUserMediaSuccess
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (video != undefined && audio != undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      // Ensure connection exists for this peer
      if (!connectionsRef.current[fromId]) {
        connectionsRef.current[fromId] = new RTCPeerConnection(
          peerConfigConnections,
        );
        connectionsRef.current[fromId].onicecandidate = (event) => {
          if (event.candidate != null) {
            socketRef.current.emit(
              "signal",
              fromId,
              JSON.stringify({ ice: event.candidate }),
            );
          }
        };
        connectionsRef.current[fromId].ontrack = (event) => {
          let videoExists = videoRef.current.find(
            (video) => video.socketId === fromId,
          );
          if (videoExists) {
            setVideos((videos) => {
              const updatedVideos = videos.map((video) =>
                video.socketId === fromId
                  ? { ...video, stream: event.streams[0] }
                  : video,
              );
              videoRef.current = updatedVideos;
              return updatedVideos;
            });
          } else {
            let newVideo = {
              socketId: fromId,
              stream: event.streams[0],
              autoPlay: true,
              playsinline: true,
            };
            setVideos((videos) => {
              const updatedVideos = [...videos, newVideo];
              videoRef.current = updatedVideos;
              return updatedVideos;
            });
          }
        };
        
        // Add local tracks safely
        if (window.localStream !== undefined && window.localStream !== null) {
          window.localStream.getTracks().forEach((track) => {
            connectionsRef.current[fromId].addTrack(track, window.localStream);
          });
        }
      }

      if (signal.sdp) {
        connectionsRef.current[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connectionsRef.current[fromId]
                .createAnswer()
                .then((description) => {
                  connectionsRef.current[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connectionsRef.current[fromId].localDescription,
                        }),
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }
      if (signal.ice) {
        connectionsRef.current[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessage) => [
      ...prevMessage,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessages) => prevMessages + 1);
    }
  };

  let connectToSocketServer = () => {
    console.log("SOCKET BASE URL =", process.env.REACT_APP_BASE_URL);
    socketRef.current = io(server_url, {
      transports: ["websocket"],
    });

    // Register all event listeners BEFORE connect
    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("chat-message", addMessage);
    socketRef.current.on("user-left", (id) => {
      // Remove peer connection
      delete connectionsRef.current[id];
      setVideos((videos) => videos.filter((video) => video.socketId != id));
    });
    socketRef.current.on("user-joined", handleUserJoined);

    // Only emit join-call after creating socket
    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      // Clear previous messages on new connection
      setMessages([]);
      socketRef.current.emit("join-call", meetingId);
    });
  };

  let handleUserJoined = (id, clients) => {
    clients.forEach((socketListId) => {
      // Check if connection already exists
      if (!connectionsRef.current[socketListId]) {
        connectionsRef.current[socketListId] = new RTCPeerConnection(
          peerConfigConnections,
        );
        connectionsRef.current[socketListId].onicecandidate = (event) => {
          if (event.candidate != null) {
            socketRef.current.emit(
              "signal",
              socketListId,
              JSON.stringify({ ice: event.candidate }),
            );
          }
        };
        connectionsRef.current[socketListId].ontrack = (event) => {
          let videoExists = videoRef.current.find(
            (video) => video.socketId === socketListId,
          );
          if (videoExists) {
            setVideos((videos) => {
              const updatedVideos = videos.map((video) =>
                video.socketId === socketListId
                  ? { ...video, stream: event.streams[0] }
                  : video,
              );
              videoRef.current = updatedVideos;
              return updatedVideos;
            });
          } else {
            let newVideo = {
              socketId: socketListId,
              stream: event.streams[0],
              autoPlay: true,
              playsinline: true,
            };
            setVideos((videos) => {
              const updatedVideos = [...videos, newVideo];
              videoRef.current = updatedVideos;
              return updatedVideos;
            });
          }
        };

        // Add local tracks safely
        if (window.localStream !== undefined && window.localStream !== null) {
          window.localStream.getTracks().forEach((track) => {
            connectionsRef.current[socketListId].addTrack(track, window.localStream);
          });
        } else {
          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          window.localStream.getTracks().forEach((track) => {
            connectionsRef.current[socketListId].addTrack(track, window.localStream);
          });
        }
      }
    });

    // Only existing users create and send offers to newly joined users
    // Newly joined users will answer those offers
    if (id === socketIdRef.current) {
      // This is the new user joining, existing users should send offers
      for (let id2 in connectionsRef.current) {
        if (id2 === socketIdRef.current) continue;
        try {
          if (window.localStream !== undefined && window.localStream !== null) {
            window.localStream.getTracks().forEach((track) => {
              connectionsRef.current[id2].addTrack(track, window.localStream);
            });
          }
        } catch (e) {
          console.log(e);
        }
        connectionsRef.current[id2]
          .createOffer()
          .then((description) => {
            connectionsRef.current[id2]
              .setLocalDescription(description)
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({
                    sdp: connectionsRef.current[id2].localDescription,
                  }),
                );
              })
              .catch((e) => console.log(e));
          })
          .catch((e) => console.log(e));
      }
    }
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);

    connectToSocketServer();
  };

  let routeTo = useNavigate();

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  let handleVideo = () => {
    setVideo(!video);
  };

  let handleAudio = () => {
    setAudio(!audio);
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;

    localVideoRef.current.srcObject = stream;

    for (let id in connectionsRef.current) {
      if (id === socketIdRef.current) {
        continue;
      }
      window.localStream.getTracks().forEach((track) => {
        connectionsRef.current[id].addTrack(track, window.localStream);
      });
      connectionsRef.current[id]
        .createOffer()
        .then((description) => {
          connectionsRef.current[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "signal",
                id,
                JSON.stringify({ sdp: connectionsRef.current[id].localDescription }),
              );
            })
            .catch((e) => console.log(e));
        })
        .catch((e) => console.log(e));
    }
    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);
          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          getUserMedia();
        }),
    );
  };
  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);
  let handleScreen = () => {
    setScreen(!screen);
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      routeTo("/home");
    } catch (e) {
      routeTo("/home");
    }
  };

  return (
    <div>
      {askForUsername === true ? (
        <div className={lobbyStyles.lobbyContainer}>
          <div className={lobbyStyles.lobbyBox}>
            <div className={lobbyStyles.lobbyLeft}>
              <h1 className={lobbyStyles.lobbyHeading}>
                Welcome to Video Call
              </h1>
              <p className={lobbyStyles.lobbySubText}>
                Enter your name and check your video preview before joining the
                meeting
              </p>

              <div className={lobbyStyles.lobbyCard}>
                <h3 className={lobbyStyles.cardTitle}>Enter Your Name</h3>
                <input
                  type="text"
                  className={lobbyStyles.usernameInput}
                  placeholder="Your name"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                />
                <Button
                  variant="contained"
                  onClick={connect}
                  className={lobbyStyles.connectBtn}
                >
                  Join Meeting
                </Button>
              </div>
            </div>

            <div className={lobbyStyles.lobbyRight}>
              <div className={lobbyStyles.videoPreview}>
                <video ref={localVideoRef} autoPlay muted></video>
                <div className={lobbyStyles.videoPLabel}>Preview</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          <video
            className="meetUserVideo"
            ref={localVideoRef}
            autoPlay
            muted
          ></video>
          {videos.map((video) => {
            return (
              <div key={video.socketId}>
                <h2> {video.socketId} </h2>
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  playsinline
                ></video>
              </div>
            );
          })}

          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.crossButton}>
                <IconButton
                  onClick={() => {
                    setModal(!showModal);
                  }}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
              </div>
              <div className={styles.chatContainer}>
                <div className={styles.chattingDisplay}>
                  {messages.map((item, index) => {
                    return (
                      <div key={index}>
                        <p>
                          <strong>{item.sender}:</strong> {item.data}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    id="outlined-basic"
                    label="Write a message"
                    variant="outlined"
                    style={{ borderRadius: ".5rem" }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className={styles.buttonContainer}>
            <IconButton onClick={handleVideo}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>

            <IconButton onClick={handleAudio}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton onClick={handleScreen}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge badgeContent={newMessages} max={999} color={"secondary"}>
              <IconButton
                onClick={() => {
                  setModal(!showModal);
                }}
                style={{ color: "white" }}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>
          <video
            className={styles.meetUserVideo}
            ref={localVideoRef}
            autoPlay
            muted
          ></video>
          <div className={styles.conferenceView}>
            {videos.map((video) => {
              return (
                <div key={video.socketId}>
                  {/* <h2> {video.socketId} </h2> */}
                  <video
                    data-socket={video.socketId}
                    ref={(ref) => {
                      if (ref && video.stream) {
                        ref.srcObject = video.stream;
                      }
                    }}
                    autoPlay
                  ></video>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
