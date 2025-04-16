import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
  createTheme,
  IconButton,
  Tooltip
} from "@mui/material";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ChatArea from "./components/ChatArea";
import ChatSidebar from "./components/ChatSidebar";
import ThemeSwitcher from "./components/ThemeSwitcher";

// Theme options
const themeOptions = [
  {
    // Green Garden (Default)
    primary: {
      main: "#4CAF50",
      light: "#81C784",
      dark: "#388E3C",
    },
    secondary: {
      main: "#FF9800",
      light: "#FFB74D",
      dark: "#F57C00",
    },
  },
  {
    // Ocean Blue
    primary: {
      main: "#2196F3",
      light: "#64B5F6",
      dark: "#1976D2",
    },
    secondary: {
      main: "#00BCD4",
      light: "#4DD0E1",
      dark: "#0097A7",
    },
  },
  {
    // Royal Purple
    primary: {
      main: "#673AB7",
      light: "#9575CD",
      dark: "#512DA8",
    },
    secondary: {
      main: "#E91E63",
      light: "#F48FB1",
      dark: "#C2185B",
    },
  },
  {
    // Sunset Orange
    primary: {
      main: "#FF5722",
      light: "#FF8A65",
      dark: "#E64A19",
    },
    secondary: {
      main: "#FFC107",
      light: "#FFD54F",
      dark: "#FFA000",
    },
  },
];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0); // Default to first theme
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'register'
  const [useLlm, setUseLlm] = useState(false); // default is false for AI explanations
  const [isNewChat, setIsNewChat] = useState(false);
  const [selectedModel, setSelectedModel] = useState("tiny_llama"); // Default model
  const [availableModels, setAvailableModels] = useState([]);

  // Load user preferences from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedTheme = parseInt(localStorage.getItem("themeIndex") || "0");
    const savedModel = localStorage.getItem("selectedModel") || "tiny_llama";
    
    setDarkMode(savedDarkMode);
    setCurrentTheme(isNaN(savedTheme) ? 0 : savedTheme);
    setSelectedModel(savedModel);
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
    localStorage.setItem("themeIndex", currentTheme.toString());
    localStorage.setItem("selectedModel", selectedModel);
  }, [darkMode, currentTheme, selectedModel]);

  // Fetch available models from the backend
  useEffect(() => {
    fetch('/api/models')
      .then(response => response.json())
      .then(data => {
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models);
        }
      })
      .catch(error => console.error('Error fetching models:', error));
  }, []);

  // Handle theme change
  const handleThemeChange = (themeIndex) => {
    setCurrentTheme(themeIndex);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    // Flash animation effect
    document.body.style.opacity = '0.8';
    setTimeout(() => {
      setDarkMode(prev => !prev);
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 50);
    }, 50);
  };

  // Create theme based on preferences
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: themeOptions[currentTheme].primary,
      secondary: themeOptions[currentTheme].secondary,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "background-color 0.3s ease, color 0.3s ease",
          },
          "*, *::before, *::after": {
            transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          },
        },
      },
    },
  });

  // Handle authentication state changes
  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(
        "Auth state changed:",
        currentUser ? "Logged in" : "Logged out"
      );
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Set up real-time listener for chat history when user is logged in
  useEffect(() => {
    if (!user) return;

    console.log("Setting up chat history listener for user:", user.uid);

    try {
      const q = query(
        collection(db, "chats"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(10)
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const chats = [];
          querySnapshot.forEach((doc) => {
            chats.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          console.log(
            "Received chat history:",
            chats.length,
            "chats",
            isNewChat ? "(new chat active)" : ""
          );
          setChatHistory(chats);

          // Only set current chat ID if we don't have one, there are chats,
          // AND we're not intentionally creating a new chat
          if (chats.length > 0 && !currentChatId && !isNewChat) {
            console.log("Setting initial current chat to:", chats[0].id);
            setCurrentChatId(chats[0].id);
          }
        },
        (error) => {
          console.error("Error in chat history listener:", error);

          // If this is an indexing error, show clear instructions
          if (
            error.code === "failed-precondition" &&
            error.message.includes("requires an index")
          ) {
            alert(
              "Firebase needs an index. Please click the link in the console error and create the index."
            );
          }
        }
      );

      return () => {
        console.log("Cleaning up chat history listener");
        unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up chat history listener:", error);
    }
  }, [user, currentChatId, isNewChat]); // Added isNewChat to dependency array

  const handleNewChat = () => {
    console.log("Creating new chat");
    setCurrentChatId(null);
    setIsNewChat(true); // Set this flag when user explicitly clicks "New Chat"
  };

  const handleSelectChat = (chatId) => {
    console.log("Selecting chat:", chatId);
    setCurrentChatId(chatId);
    setIsNewChat(false); // Reset the new chat flag when selecting an existing chat
  };

  const handleChatCreated = (chatId) => {
    console.log("New chat created with ID:", chatId);
    setCurrentChatId(chatId);
    setIsNewChat(false); // Reset the flag once a new chat is created
  };

  const handleToggleLlm = () => {
    console.log("Toggling LLM state from", useLlm, "to", !useLlm);
    setUseLlm(!useLlm);
  };

  const handleModelChange = (modelId) => {
    console.log("Changing model to:", modelId);
    setSelectedModel(modelId);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // In the render function section, update the auth logic:
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!user ? (
        authMode === "login" ? (
          <Login onSwitchToRegister={() => setAuthMode("register")} />
        ) : (
          <Register onSwitchToLogin={() => setAuthMode("login")} />
        )
      ) : (
        <Box sx={{ display: "flex", height: "100vh" }}>
          <ChatSidebar
            chatHistory={chatHistory}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            currentUser={user}
            currentChatId={currentChatId}
            // Controls
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            useLlm={useLlm}
            onToggleLlm={handleToggleLlm}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            availableModels={availableModels}
          />
          <ChatArea
            darkMode={darkMode}
            useLlm={useLlm}
            currentChatId={currentChatId}
            userId={user.uid}
            onChatCreated={handleChatCreated}
            onToggleLlm={handleToggleLlm}
            currentUser={user}
            selectedModel={selectedModel}
          />
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;
