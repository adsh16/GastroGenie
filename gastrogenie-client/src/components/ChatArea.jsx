// src/components/ChatArea.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  IconButton,
  Avatar,
  Skeleton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import PersonIcon from "@mui/icons-material/Person";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

import { FormControlLabel, Switch } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const suggestions = [
  "Quick dinner ideas with chicken",
  "Mediterranean desserts",
  "Vegetarian high-protein recipes",
  "Gluten-free breakfast ideas",
  // Add more suggestions here
  "Low-carb dinner recipes",
  "Asian fusion lunch ideas",
  "Vegan desserts",
  "Keto-friendly breakfast options",
];

function ChatArea({
  darkMode,
  useLlm = false,
  currentChatId,
  userId,
  currentUser,
  onChatCreated,
  onToggleLlm,
}) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatboxRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [localUseLlm, setLocalUseLlm] = useState(useLlm);

  useEffect(() => {
    setLocalUseLlm(useLlm);
  }, [useLlm]);

  useEffect(() => {
    const handleScroll = () => {
      if (chatboxRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatboxRef.current;
        setShowScrollTop(scrollTop < scrollHeight - clientHeight - 100);
      }
    };

    const chatbox = chatboxRef.current;
    if (chatbox) {
      chatbox.addEventListener("scroll", handleScroll);
      return () => chatbox.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTo({
        top: chatboxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Add this useEffect to load messages when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      loadMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  // Add this function to load messages from Firestore
  const loadMessages = async (chatId) => {
    try {
      const chatDoc = await getDoc(doc(db, "chats", chatId));
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        setMessages(chatData.messages || []);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Add this function to save chat to Firestore
  const saveChat = async (newMessages, userQuery) => {
    if (!userId) {
      console.log("Not saving chat - no user ID");
      return;
    }

    try {
      if (currentChatId) {
        console.log("Updating existing chat:", currentChatId);
        await updateDoc(doc(db, "chats", currentChatId), {
          messages: newMessages,
          lastMessage: userQuery,
          timestamp: serverTimestamp(),
          // Add a client timestamp as fallback
          clientTimestamp: new Date().toISOString(),
        });
      } else {
        console.log("Creating new chat for user:", userId);
        const chatTitle =
          userQuery.length > 30
            ? userQuery.substring(0, 30) + "..."
            : userQuery;

        const docRef = await addDoc(collection(db, "chats"), {
          userId,
          title: chatTitle,
          messages: newMessages,
          lastMessage: userQuery,
          timestamp: serverTimestamp(),
          // Add a client timestamp as fallback
          clientTimestamp: new Date().toISOString(),
        });

        console.log("New chat created with ID:", docRef.id);
        if (onChatCreated) {
          onChatCreated(docRef.id);
        }
      }
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSendMessage(suggestion);
  };

  const handleSendMessage = async (text = query) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { type: "user", content: text }];
    setMessages(newMessages);
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: text,
          use_llm: localUseLlm,
        }),
      });

      const data = await response.json();

      // Create final messages array once
      const finalMessages = [
        ...newMessages,
        ...data.map((item) => ({
          type: "bot",
          content: item,
        })),
      ];

      // Delay to show skeleton effect
      setTimeout(() => {
        setMessages(finalMessages);
        setLoading(false);

        // Save to Firebase
        if (userId) {
          saveChat(finalMessages, text);
        }
      }, 1000); // 1 second delay to show skeleton
    } catch (error) {
      console.error("Error:", error);

      // Create error messages array once
      const errorMessages = [
        ...newMessages,
        {
          type: "bot",
          content: {
            title: "Error",
            description: "⚠️ Error fetching recipes. Please try again later.",
            is_error: true,
          },
        },
      ];

      setMessages(errorMessages);
      setLoading(false);

      // Save error message too
      if (userId) {
        saveChat(errorMessages, text);
      }
    }
  };

  const renderMessageItem = (message, index) => {
    const isUser = message.type === "user";

    return (
      <Box
        key={index}
        sx={{
          display: "flex",
          flexDirection: "column",
          my: 4,
          borderBottom: message.type === "bot" ? `1px solid` : "none",
          borderColor: "divider",
          pb: message.type === "bot" ? 4 : 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
          {isUser ? (
            <Avatar
              src={currentUser?.photoURL}
              sx={{
                bgcolor: "primary.dark",
                width: 36,
                height: 36,
              }}
            >
              <PersonIcon />
            </Avatar>
          ) : (
            <Avatar
              // gastrogenie-client\src\assests\gastro-genie-icon-1024-1024.png
              src="/images/gastro-genie-icon-1024-1024.png"
              sx={{
                bgcolor: "primary.light",
                width: 36,
                height: 36,
              }}
            >
              {/* fallback image */}
              <RestaurantMenuIcon />
            </Avatar>
          )}

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1,
                color: isUser ? "primary.main" : "text.primary",
              }}
            >
              {isUser ? currentUser?.displayName || "You" : "GastroGenie"}
            </Typography>

            {isUser ? (
              <Typography variant="body1">{message.content}</Typography>
            ) : (
              renderRecipeCard(message.content)
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  const renderRecipeCard = (recipe) => {
    const isLlmCard = recipe.is_llm_card;

    return (
      <Paper
        elevation={0}
        square
        sx={{
          overflow: "hidden",
          borderRadius: 2,
          mb: 1,
          border: "1px solid",
          borderColor: "divider",
          ...(isLlmCard && {
            bgcolor: darkMode
              ? "rgba(66, 165, 245, 0.1)"
              : "rgba(30, 136, 229, 0.05)",
            borderLeft: "3px solid",
            borderColor: "primary.main",
          }),
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
            {recipe.title}
          </Typography>

          {recipe.img_url && !isLlmCard && (
            <Box
              component="img"
              src={recipe.img_url}
              alt={recipe.title}
              sx={{
                width: "100%",
                height: 240,
                objectFit: "cover",
                borderRadius: 1,
                mb: 2,
              }}
            />
          )}

          {!isLlmCard && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 2 }}>
              {recipe.Time && (
                <Chip
                  label={`⏱️ ${recipe.Time}`}
                  size="small"
                  sx={{ bgcolor: "background.default" }}
                />
              )}
              {recipe.Calories && (
                <Chip
                  label={`🔥 ${recipe.Calories} Calories`}
                  size="small"
                  sx={{ bgcolor: "background.default" }}
                />
              )}
              {recipe.Protein && (
                <Chip
                  label={`💪 ${recipe.Protein}g Protein`}
                  size="small"
                  sx={{ bgcolor: "background.default" }}
                />
              )}
              {recipe.Sub_region && (
                <Chip
                  label={recipe.Sub_region}
                  size="small"
                  sx={{ bgcolor: "background.default" }}
                />
              )}
            </Box>
          )}

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {recipe.description}
          </Typography>

          {!isLlmCard && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
              {recipe.url && (
                <Button
                  variant="outlined"
                  href={recipe.url}
                  target="_blank"
                  rel="noopener"
                  startIcon={<span>📖</span>}
                  sx={{ borderRadius: 6 }}
                >
                  View Recipe
                </Button>
              )}

              {recipe.youtube_video && (
                <Button
                  variant="contained"
                  href={recipe.youtube_video}
                  target="_blank"
                  rel="noopener"
                  startIcon={<span>▶️</span>}
                  sx={{
                    borderRadius: 6,
                    bgcolor: "#ff0000",
                    "&:hover": {
                      bgcolor: "#d32f2f",
                    },
                  }}
                >
                  Watch Tutorial
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        ml: { xs: "70px", md: "260px" },
        height: "100vh",
      }}
    >
      <Box
        ref={chatboxRef}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: { xs: 2, md: 5 },
          pt: 4,
          pb: 12,
          position: "relative",
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              maxWidth: "800px",
              margin: "0 auto",
              pt: { xs: 4, md: 10 },
              textAlign: "center",
            }}
          >
            <Typography variant="h1" gutterBottom>
              Your Personal Culinary Assistant
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Discover recipes, get cooking advice, and find meal ideas tailored
              to your preferences and dietary needs.
            </Typography>

            <Box sx={{ mb: 5 }}>
              <Typography variant="h2" gutterBottom sx={{ fontSize: "1.1rem" }}>
                Try asking about:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  justifyContent: "center",
                  mt: 2,
                }}
              >
                {suggestions.map((suggestion, idx) => (
                  <Chip
                    key={idx}
                    label={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{
                      borderRadius: "16px",
                      py: 1,
                      px: 1,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": {
                        bgcolor: "primary.main",
                        color: "white",
                      },
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ maxWidth: "800px", margin: "0 auto" }}>
            {messages.map((message, index) =>
              renderMessageItem(message, index)
            )}

            {loading && (
              <Box sx={{ mt: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Avatar
                    sx={{ bgcolor: "primary.light", width: 36, height: 36 }}
                  >
                    <RestaurantMenuIcon />
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Skeleton
                      variant="text"
                      width={100}
                      height={24}
                      sx={{ mb: 1 }}
                    />

                    <Paper
                      elevation={0}
                      sx={{
                        overflow: "hidden",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        p: { xs: 2, sm: 3 },
                      }}
                    >
                      <Skeleton
                        variant="text"
                        width="50%"
                        height={32}
                        sx={{ mb: 2 }}
                      />

                      {!useLlm && (
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height={200}
                          sx={{ borderRadius: 1, mb: 2 }}
                        />
                      )}

                      {!useLlm && (
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            my: 2,
                            flexWrap: "wrap",
                          }}
                        >
                          <Skeleton variant="rounded" width={100} height={32} />
                          <Skeleton variant="rounded" width={120} height={32} />
                          <Skeleton variant="rounded" width={110} height={32} />
                        </Box>
                      )}

                      <Box sx={{ mb: 2 }}>
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="90%" />
                        {useLlm && (
                          <>
                            <Skeleton variant="text" width="95%" />
                            <Skeleton variant="text" width="85%" />
                          </>
                        )}
                      </Box>

                      {!useLlm && (
                        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                          <Skeleton variant="rounded" width={120} height={36} />
                          <Skeleton variant="rounded" width={150} height={36} />
                        </Box>
                      )}
                    </Paper>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {showScrollTop && (
          <IconButton
            onClick={scrollToBottom}
            sx={{
              position: "fixed",
              bottom: 90,
              right: 20,
              bgcolor: "background.paper",
              boxShadow: 3,
              "&:hover": {
                bgcolor: "primary.main",
                color: "white",
              },
            }}
          >
            <KeyboardDoubleArrowDownIcon />
          </IconButton>
        )}
      </Box>

      <Paper
        elevation={0}
        square
        sx={{
          position: "fixed",
          bottom: 0,
          right: 0,
          left: { xs: "70px", md: "260px" },
          p: 2,
          height: { xs: "60px", md: "124px" }, // Changed from 100px to 124px to match sidebar
          borderTop: "1px solid",
          borderColor: "divider",
          zIndex: 2,
          backgroundColor: "background.paper",
          display: "flex",
          alignItems: "center", // Center the input form vertically
          justifyContent: "center", // Center the form horizontally
        }}
      >
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          sx={{
            display: "flex",
            gap: 2,
            width: "100%", // Take full width of the container
            maxWidth: "1000px", // Increased from 800px to 1200px
            px: { xs: 1, md: 4 }, // Add horizontal padding on different screen sizes
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask about recipes, ingredients, or cooking techniques..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            InputProps={{
              sx: {
                borderRadius: 0, // Changed from "12px" to make it flush
                backgroundColor: darkMode
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.03)",
                "&:focus-within": {
                  boxShadow: "none", // Removed the focus shadow
                  borderColor: "primary.main", // Added this for better focus indication
                  borderWidth: "1px",
                },
                border: "1px solid",
                borderColor: "divider",
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 0, // Changed from "12px" to make it flush
              minWidth: "56px",
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <SendIcon />
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default ChatArea;
