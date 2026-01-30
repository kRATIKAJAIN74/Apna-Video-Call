import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "../styles/history.module.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import HomeIcon from "@mui/icons-material/Home";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(Array.isArray(history) ? history : []);
      } catch (err) {
        setMeetings([]);
      }
    };

    fetchHistory();
  }, [getHistoryOfUser]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
   <div className={styles.historyPage}>
  <div className={styles.header}>
    <IconButton onClick={() => routeTo("/home")}>
      <HomeIcon />
    </IconButton>
    <h2 className={styles.title}>Meeting History</h2>
  </div>

  {meetings.length > 0 ? (
    <div className={styles.cardContainer}>
      {meetings.map((e, i) => (
        <Card key={i} variant="outlined" className={styles.card}>
          <CardContent>
            <Typography className={styles.code}>
              Code: <span>{e.meetingCode}</span>
            </Typography>

            <div className={styles.meta}>
              <Typography className={styles.metaText}>
                📅 {formatDate(e.date)}
              </Typography>

              <Typography className={styles.metaText}>
                ⏰ {formatTime(e.date)}
              </Typography>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ) : (
    <p className={styles.empty}>No meeting history found</p>
  )}
</div>
  );
}
