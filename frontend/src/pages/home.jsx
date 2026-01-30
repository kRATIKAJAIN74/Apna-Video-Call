import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
// import "../App.css";
import styles from "../styles/home.module.css";

import RestoreIcon from "@mui/icons-material/Restore";
import IconButton from "@mui/material/IconButton";
import { Button, TextField } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };
  return (
    <>
      <div className={styles.navBar}>
        {/* Left side */}
        <div className={styles.navLeft}>
          <h2 className={styles.logo}>Apna Video Call</h2>
        </div>

        {/* Right side */}
        <div className={styles.navRight}>
          <div className={styles.historyBtn}>
            <IconButton  onClick={
              ()=> {
                navigate("/history")
              }
            } 
            size="small">
              <RestoreIcon />
            </IconButton>
            <span>History</span>
          </div>

          <Button
            variant="outlined"
            className={styles.logoutBtn}
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className={styles.meetContainer}>
        <div className={styles.leftPanel}>
          <h2 className={styles.heading}>
            Quality Video Calls,
            <br />
            Just Like Quality Education
          </h2>

          <p className={styles.subText}>
            Enter a meeting code to instantly join a secure video call.
          </p>

          <div className={styles.joinBox}>
            <TextField
              onChange={(e) => setMeetingCode(e.target.value)}
              label="Meeting Code"
              variant="outlined"
              size="small"
              className={styles.input}
            />
            <Button
              onClick={handleJoinVideoCall}
              variant="contained"
              className={styles.joinBtn}
            >
              Join
            </Button>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <img src="/logo3.png" alt="Video Call Illustration" />
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);
