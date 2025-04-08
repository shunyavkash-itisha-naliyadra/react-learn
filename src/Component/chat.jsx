import React, { useState, useEffect, use } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Avatar,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import socket from "../socket.js";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PhoneIcon from "@mui/icons-material/Phone";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import SearchIcon from "@mui/icons-material/Search";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

export default function ChatApp() {
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    // const fetchContacts = async () => {
    //   try {
    //     const response = await fetch("http://localhost:8081/api/v1/account/");
    //     const data = await response.json();
    //     setContacts(data?.data?.accounts || []);
    //   } catch (error) {
    //     console.error("Failed to fetch contacts:", error);
    //   }
    // };
    const fetchMessages = async () => {
      try {
        console.log("Fetching messages from API..."); // Debug log
        const response = await fetch(`http://localhost:8081/api/v1/message/`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`); // Handle non-200 responses
        }

        const data = await response.json();
        console.log("API response data:", data); // Debug log

        if (data?.data?.success === true) {
          setMessages(data?.data?.messages);
          alert({
            msg: "Messages fetched successfully",
            type: "success",
          });
        } else {
          alert({ msg: "Failed to fetch messages", type: "error" });
        }
      } catch (error) {
        console.error("Error fetching messages:", error); // Improved error log
        alert({
          msg: `Failed to fetch messages: ${error.message}`,
          type: "error",
        });
      }
    };

    fetchMessages();
    // fetchContacts();
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      const messageData = {
        id: Date.now(),
        text: input,
        sender: "me",
        timestamp: new Date(),
      };
      socket.emit("sendMessage", messageData);
      setMessages([...messages, messageData]);
      setInput("");
    }
  };

  useEffect(() => {
    // Log to verify socket connection
    console.log("Setting up socket listener for 'receiveMessage'");

    socket.on("receiveMessage", (data) => {
      console.log("Message received:", data); // Debug log
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      console.log("Cleaning up socket listener for 'receiveMessage'"); // Debug log
      socket.off("receiveMessage");
    };
  }, []);

  return (
    <Box
      display="flex"
      height="100vh"
      width="100vw"
      sx={{ background: "#F0F2F5" }}
    >
      {/* Sidebar */}
      <Paper sx={{ width: "30%", borderRight: "1px solid #ccc" }}>
        <AppBar position="static" sx={{ background: "#128C7E" }}>
          <Toolbar>
            <Typography variant="h6">WhatsApp</Typography>
          </Toolbar>
        </AppBar>
        <Box
          display="flex"
          alignItems="center"
          p={1}
          sx={{ background: "#FFF" }}
        >
          <IconButton>
            <SearchIcon />
          </IconButton>
          <TextField
            fullWidth
            placeholder="Search or start new chat"
            variant="standard"
          />
        </Box>
        <List>
          {contacts.map((contact) => (
            <ListItem
              button
              key={contact.id || contact._id}
              onClick={() => setSelectedContact(contact)}
            >
              <Avatar
                src={contact.profilePhoto}
                sx={{ marginInlineEnd: "10px" }}
              />
              <ListItemText
                primary={contact.firstName + " " + contact.lastName}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Chat Window */}
      <Box flex={1} display="flex" flexDirection="column">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <AppBar position="static" sx={{ background: "#128C7E" }}>
              <Toolbar>
                <Avatar src={selectedContact.profilePhoto} />
                <Typography variant="h6" sx={{ marginLeft: 2 }}>
                  {selectedContact.userName}
                </Typography>
                <Box sx={{ marginLeft: "auto" }}>
                  <IconButton>
                    <VideoCallIcon />
                  </IconButton>
                  <IconButton>
                    <PhoneIcon />
                  </IconButton>
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Toolbar>
            </AppBar>

            {/* Messages Area */}
            <Box
              flex={1}
              p={2}
              sx={{ overflowY: "auto", background: "#ECE5DD" }}
            >
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    textAlign: msg.sender === "me" ? "right" : "left",
                    marginBottom: 1,
                  }}
                >
                  <Paper
                    sx={{
                      display: "inline-block",
                      padding: "8px 12px",
                      borderRadius: 2,
                      background: msg.sender === "me" ? "#DCF8C6" : "#FFF",
                    }}
                  >
                    {msg.content}
                  </Paper>
                </Box>
              ))}
            </Box>

            {/* Input Box */}
            <Box
              display="flex"
              alignItems="center"
              p={2}
              sx={{ background: "#FFF", borderTop: "1px solid #ccc" }}
            >
              <IconButton>
                <EmojiEmotionsIcon />
              </IconButton>
              <IconButton>
                <AttachFileIcon />
              </IconButton>
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <IconButton color="primary" onClick={sendMessage}>
                <SendIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flex={1}
          >
            <ChatIcon sx={{ fontSize: 100, color: "#ccc" }} />
            <Typography variant="h6">Select a contact to chat</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
