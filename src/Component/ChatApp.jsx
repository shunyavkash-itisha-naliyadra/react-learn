import React, { useState, useEffect } from "react";
import "../css/login.css";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ChatIcon from "@mui/icons-material/Chat";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PhoneIcon from "@mui/icons-material/Phone";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import Picker from "emoji-picker-react";
import socket from "../socket";
import AlertMessage from "../utils/AlertMessage";
import ContactDialog from "./Contact";
import LogoutIcon from "@mui/icons-material/Logout";
import { logOutApi } from "../utils/LogOut";
export default function ChatApp() {
  const [alert, setAlert] = useState(null);
  const [send, setSend] = useState("");
  const [contacts, setContacts] = useState([]);
  const [openContactModal, setOpenContactModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/api/v1/account?search=${encodeURIComponent(searchQuery)}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();
        console.log("data?.data?.accounts", data?.data);
        setSend(data?.data?.loginUser);

        if (data?.data?.accounts?.length > 0) {
          setContacts(data?.data?.accounts);
        } else {
          setContacts([]);
          setAlert({
            message:
              "No accounts found. Please add contacts to start chatting.",
            type: "info",
          });
        }
      } catch (error) {
        setAlert({
          message: error.response?.data?.message || "Failed to fetch contacts.",
          type: "error",
        });
        console.error("Failed to fetch contacts:", error);
      }
    };
    const fetchMessages = async () => {
      if (!selectedContact || !send) return;
      console.log("selectedContact", selectedContact, send);

      try {
        const response = await fetch(
          `http://localhost:8081/api/v1/message/getById?senderId=${send}&receiverId=${selectedContact._id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();
        if (data?.success === true) {
          // Directly use the messages array from the API response
          setMessages(data?.data);
        } else {
          setAlert({ msg: "Failed to fetch messages", type: "error" });
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setAlert({
          msg: `Failed to fetch messages: ${error?.Response?.statusText}`,
          type: "error",
        });
      }
    };
    fetchMessages();
    fetchContacts();
  }, [searchQuery, selectedContact]);
  const sendMessage = async () => {
    if (input.trim() && selectedContact) {
      const messageData = {
        sender: send,
        receiver: selectedContact._id || selectedContact.id,
        content: input,
      };
      try {
        const response = await fetch("http://localhost:8081/api/v1/message/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(messageData),
        });

        const savedMessage = await response.json();
        if (response.ok) {
          socket.emit("sendMessage", savedMessage.data);
          setMessages((prevMessages) => [...prevMessages, savedMessage.data]);
          setInput("");
        } else {
          setAlert({ message: savedMessage.message, type: "error" });
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        setAlert({ message: "Failed to send message", type: "error" });
      }
    }
  };
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    return () => {
      socket.off("receiveMessage");
    };
  }, []);
  useEffect(() => {
    // Listen for real-time updates for user online/offline status
    socket.on("userOnline", (userId) => {
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact._id === userId || contact.id === userId
            ? { ...contact, isOnline: true }
            : contact
        )
      );
    });

    socket.on("userOffline", (userId) => {
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact._id === userId || contact.id === userId
            ? { ...contact, isOnline: false }
            : contact
        )
      );
    });

    return () => {
      // Clean up listeners on component unmount
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await logOutApi();
      if (response.ok) {
        window.location.href = "/login";
      } else {
        const errorData = await response.json();
        setAlert({
          message: errorData.message || "Logout failed",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setAlert({ message: "Logout failed. Please try again.", type: "error" });
    }
  };

  return (
    <Box
      display="flex"
      height="100vh"
      width="100vw"
      sx={{ background: "#F0F2F5" }}
    >
      <Paper sx={{ width: "30%", borderRight: "1px solid #ccc" }}>
        <AppBar position="static" sx={{ background: "#128C7E" }}>
          <Toolbar className="toolbar-header">
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              <ChatIcon sx={{ fontSize: 30, color: "#ccc" }} />
            </Typography>
            <Box>
              <IconButton onClick={() => setOpenContactModal(true)}>
                <AddIcon />
              </IconButton>
              <IconButton onClick={handleLogout}>
                <LogoutIcon sx={{ color: "#fff" }} />
              </IconButton>
            </Box>
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
            color="success"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <List>
          {contacts.map((contact) => {
            const isCurrentUser = contact._id === send || contact.id === send;
            const profilePhotoPath =
              contact?.profilePhoto || "default-profile.jpg";
            const imageUrl = `http://localhost:8081/${profilePhotoPath}`;

            return (
              <ListItem
                button
                key={contact.id || contact._id}
                onClick={() => setSelectedContact(contact)}
              >
                <Avatar src={imageUrl} sx={{ marginInlineEnd: "10px" }} />
                <ListItemText
                  primary={
                    isCurrentUser
                      ? `${contact.firstName} ${contact.lastName} (You)`
                      : `${contact.firstName} ${contact.lastName}`
                  }
                  secondary={
                    isCurrentUser
                      ? "Online"
                      : contact.isOnline
                        ? "Online"
                        : (() => {
                            const lastOnlineDate = new Date(contact.updatedAt);
                            const today = new Date();
                            const isToday =
                              lastOnlineDate.toDateString() ===
                              today.toDateString();
                            return isToday
                              ? `Last seen: ${lastOnlineDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                              : `Last seen: ${lastOnlineDate.toLocaleString()}`;
                          })()
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>
      <ContactDialog
        open={openContactModal}
        onClose={() => setOpenContactModal(false)}
        onContactAdded={(newContact) => {
          setContacts((prevContacts) => [...prevContacts, newContact]);
        }}
      />
      {/* Chat Window */}
      <Box flex={1} display="flex" flexDirection="column">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <AppBar position="static" sx={{ background: "#128C7E" }}>
              <Toolbar>
                <Avatar
                  src={`http://localhost:8081/${selectedContact?.profilePhoto}`}
                  sx={{ marginInlineEnd: "10px" }}
                />
                {(() => {
                  const isCurrentUser =
                    selectedContact._id === send || selectedContact.id === send;
                  return (
                    <>
                      <Typography variant="h6" sx={{ marginLeft: 2 }}>
                        {isCurrentUser
                          ? `${selectedContact.firstName} ${selectedContact.lastName} (You)`
                          : `${selectedContact.firstName} ${selectedContact.lastName}`}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ marginLeft: 2, color: "#ccc" }}
                      >
                        {isCurrentUser
                          ? "Online"
                          : selectedContact.isOnline
                            ? "Online"
                            : (() => {
                                const lastOnlineDate = new Date(
                                  selectedContact.updatedAt
                                );
                                const today = new Date();
                                const isToday =
                                  lastOnlineDate.toDateString() ===
                                  today.toDateString();
                                return isToday
                                  ? `Last seen: ${lastOnlineDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                  : `Last seen: ${lastOnlineDate.toLocaleString()}`;
                              })()}
                      </Typography>
                    </>
                  );
                })()}
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
              {messages && messages.length > 0 ? (
                messages
                  .filter(
                    (msg) =>
                      msg &&
                      ((msg.sender === send &&
                        msg.receiver === selectedContact?._id) ||
                        (msg.receiver === send &&
                          msg.sender === selectedContact?._id))
                  )
                  .map((msg, index) => {
                    const isSender = msg.sender === send;
                    console.log("Filtered Message:", msg); // Debugging log

                    return (
                      <Box
                        key={index}
                        display="flex"
                        justifyContent={isSender ? "flex-end" : "flex-start"}
                        mb={1}
                      >
                        <Paper
                          sx={{
                            maxWidth: "60%",
                            padding: "8px 12px",
                            borderRadius: 2,
                            backgroundColor: isSender ? "#DCF8C6" : "#FFFFFF",
                            boxShadow: 1,
                          }}
                        >
                          <Typography>{msg.content}</Typography>
                        </Paper>
                      </Box>
                    );
                  })
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: "#888", textAlign: "center" }}
                >
                  No messages to display.
                </Typography>
              )}
            </Box>

            {/* Input Box */}
            <Box
              display="flex"
              alignItems="center"
              p={2}
              sx={{ background: "#FFF", borderTop: "1px solid #ccc" }}
            >
              <IconButton
                sx={{ outline: "none" }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <EmojiEmotionsIcon />
              </IconButton>
              {showEmojiPicker && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "39.5%",
                    left: "30%",
                    zIndex: 10,
                  }}
                >
                  <Picker
                    onEmojiClick={(emojiObject) => {
                      if (emojiObject?.emoji) {
                        setInput((prevInput) => prevInput + emojiObject.emoji);
                      }
                    }}
                  />
                </Box>
              )}
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
      {alert && (
        <AlertMessage
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
    </Box>
  );
}
