import React, { useState, useEffect, useRef } from "react";
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
  const chatContainerRef = useRef(null);
  const [unreadMessages, setUnreadMessages] = useState({}); // Track unread messages per contact

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
          setMessages(data?.data);
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

      // Update unread messages count if the message is from a different contact
      if (data.sender !== selectedContact?._id) {
        setUnreadMessages((prevUnread) => ({
          ...prevUnread,
          [data.sender]: (prevUnread[data.sender] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedContact]);
  useEffect(() => {
    if (send) {
      socket.emit("userOnline", send);
    }
  }, [send]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // useEffect(() => {
  //   if (send) {
  //     socket.emit("joinRoom", { userId: send });
  //   }

  //   socket.on("incomingCall", ({ from, offer }) => {
  //     console.log(`Incoming call from ${from}`, offer);
  //   });

  //   socket.on("callAnswered", ({ answer }) => {
  //     console.log("Call answered:", answer);
  //   });

  //   socket.on("iceCandidate", ({ candidate }) => {
  //     console.log("Received ICE candidate:", candidate);
  //   });

  //   return () => {
  //     socket.off("incomingCall");
  //     socket.off("callAnswered");
  //     socket.off("iceCandidate");
  //   };
  // }, [send]);
  // const initiateCall = (contactId) => {
  //   const offer = {};
  //   socket.emit("callUser", { to: contactId, offer, from: send });
  // };
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
  const constraints = {
    video: true,
    audio: true,
  };
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    console.log("stream", stream);
    const videoTracks = stream.getVideoTracks();
    console.log("videoTracks", videoTracks);
    console.log("Got stream with constraints:", constraints);
    console.log(`Using video device: ${videoTracks[0].label}`);
    stream.onremovetrack = () => {
      console.log("Stream ended");
    };
    video.srcObject = stream;
  });

  // Utility function to categorize messages by date
  const categorizeMessages = (messages) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (date) =>
      date.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

    const categorized = {
      today: [],
      yesterday: [],
      others: {},
    };

    messages.forEach((msg) => {
      const messageDate = new Date(msg.createdAt);
      const isToday = messageDate.toDateString() === today.toDateString();
      const isYesterday =
        messageDate.toDateString() === yesterday.toDateString();

      if (isYesterday) {
        categorized.yesterday.push(msg);
      } else if (isToday) {
        categorized.today.push(msg);
      } else {
        const formattedDate = formatDate(messageDate);
        if (!categorized.others[formattedDate]) {
          categorized.others[formattedDate] = [];
        }
        categorized.others[formattedDate].push(msg);
      }
    });

    return categorized;
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
            const unreadCount = unreadMessages[contact._id || contact.id] || 0;

            return (
              <ListItem
                button
                key={contact.id || contact._id}
                onClick={() => {
                  setSelectedContact(contact);
                  setUnreadMessages((prevUnread) => ({
                    ...prevUnread,
                    [contact._id || contact.id]: 0, // Reset unread count for selected contact
                  }));
                }}
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
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      background: "#25D366",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: "auto",
                    }}
                  >
                    <Typography variant="caption">{unreadCount}</Typography>
                  </Box>
                )}
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
                  <IconButton
                    onClick={() =>
                      initiateCall(selectedContact._id || selectedContact.id)
                    }
                  >
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
              ref={chatContainerRef}
              sx={{
                overflowY: "auto",
                background: "#ECE5DD",
                display: "flex",
                flexDirection: "column", // Adjusted to render messages in correct order
              }}
            >
              {messages && messages.length > 0 ? (
                (() => {
                  const categorizedMessages = categorizeMessages(
                    messages.filter(
                      (msg) =>
                        msg &&
                        ((msg.sender === send &&
                          msg.receiver === selectedContact?._id) ||
                          (msg.receiver === send &&
                            msg.sender === selectedContact?._id))
                    )
                  );

                  return (
                    <>
                      {categorizedMessages.yesterday.length > 0 && (
                        <>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#888",
                              textAlign: "center",
                              marginBottom: 1,
                            }}
                          >
                            Yesterday
                          </Typography>
                          {categorizedMessages.yesterday.map((msg, index) => {
                            const isSender = msg.sender === send;
                            return (
                              <Box
                                key={`yesterday-${index}`}
                                display="flex"
                                justifyContent={
                                  isSender ? "flex-end" : "flex-start"
                                }
                                mb={1}
                              >
                                <Paper
                                  sx={{
                                    maxWidth: "60%",
                                    padding: "8px 12px",
                                    borderRadius: 2,
                                    backgroundColor: isSender
                                      ? "#DCF8C6"
                                      : "#FFFFFF",
                                    boxShadow: 1,
                                  }}
                                >
                                  <Typography>{msg.content}</Typography>
                                </Paper>
                              </Box>
                            );
                          })}
                        </>
                      )}
                      {categorizedMessages.today.length > 0 && (
                        <>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#888",
                              textAlign: "center",
                              marginBottom: 1,
                            }}
                          >
                            Today
                          </Typography>
                          {categorizedMessages.today.map((msg, index) => {
                            const isSender = msg.sender === send;
                            return (
                              <Box
                                key={`today-${index}`}
                                display="flex"
                                justifyContent={
                                  isSender ? "flex-end" : "flex-start"
                                }
                                mb={1}
                              >
                                <Paper
                                  sx={{
                                    maxWidth: "60%",
                                    padding: "8px 12px",
                                    borderRadius: 2,
                                    backgroundColor: isSender
                                      ? "#DCF8C6"
                                      : "#FFFFFF",
                                    boxShadow: 1,
                                  }}
                                >
                                  <Typography>{msg.content}</Typography>
                                </Paper>
                              </Box>
                            );
                          })}
                        </>
                      )}
                      {Object.keys(categorizedMessages.others).map(
                        (date, index) => (
                          <React.Fragment key={`others-${index}`}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#888",
                                textAlign: "center",
                                marginBottom: 1,
                              }}
                            >
                              {date}
                            </Typography>
                            {categorizedMessages.others[date].map(
                              (msg, msgIndex) => {
                                const isSender = msg.sender === send;
                                return (
                                  <Box
                                    key={`others-${date}-${msgIndex}`}
                                    display="flex"
                                    justifyContent={
                                      isSender ? "flex-end" : "flex-start"
                                    }
                                    mb={1}
                                  >
                                    <Paper
                                      sx={{
                                        maxWidth: "60%",
                                        padding: "8px 12px",
                                        borderRadius: 2,
                                        backgroundColor: isSender
                                          ? "#DCF8C6"
                                          : "#FFFFFF",
                                        boxShadow: 1,
                                      }}
                                    >
                                      <Typography>{msg.content}</Typography>
                                    </Paper>
                                  </Box>
                                );
                              }
                            )}
                          </React.Fragment>
                        )
                      )}
                    </>
                  );
                })()
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: "#888", textAlign: "center" }}
                >
                  Not found messages.
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
