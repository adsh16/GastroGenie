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
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PublicIcon from "@mui/icons-material/Public";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import YouTubeIcon from "@mui/icons-material/YouTube";

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

// Text suggestions for quick suggestion chips
const suggestions = [
  "Quick dinner ideas with chicken",
  "Mediterranean desserts",
  "Vegetarian high-protein recipes",
  "Gluten-free breakfast ideas",
  "Low-carb dinner recipes",
  "Asian fusion lunch ideas",
  "Vegan desserts",
  "Keto-friendly breakfast options",
  "Healthy meal prep ideas",
  "Quick pasta recipes",
  "Smoothie bowl recipes", 
  "30-minute meals",
  "Healthy snack ideas",
  "Indian curry recipes",
  "Mexican food recipes",
  "Baking recipes for beginners",
  "Slow cooker recipes",
  "Air fryer recipes",
  "Healthy salad ideas",
  "Holiday baking recipes"
];

function ChatArea({
  darkMode,
  useLlm = false,
  currentChatId,
  userId,
  currentUser,
  onChatCreated,
  onToggleLlm,
  selectedModel = "tiny_llama"
}) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingStepName, setProcessingStepName] = useState("");
  const chatboxRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [localUseLlm, setLocalUseLlm] = useState(useLlm);
  const theme = useTheme();
  
  // Real processing steps for AI thinking - these match backend stages
  const processingSteps = useLlm ? [
    "Initializing request",
    "Tokenizing input",
    "Processing with LLM",
    "Searching recipe database",
    "Ranking results",
    "Generating explanations",
    "Formatting response"
  ] : [
    "Processing request",
    "Searching database",
    "Filtering results",
    "Preparing response"
  ];

  // Organize suggestions for 3 rows with different directions
  const createSuggestionRows = () => {
    // Split suggestions into 3 rows
    const totalSuggestions = suggestions.length;
    const itemsPerRow = Math.ceil(totalSuggestions / 3);
    
    const rows = [
      // Row 1: left to right
      suggestions.slice(0, itemsPerRow),
      // Row 2: right to left (will be reversed in animation)
      suggestions.slice(itemsPerRow, itemsPerRow * 2),
      // Row 3: left to right
      suggestions.slice(itemsPerRow * 2, totalSuggestions)
    ];
    
    return rows;
  };
  
  const suggestionRows = createSuggestionRows();

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
    setProcessingStep(0);
    setProcessingStepName(processingSteps[0]);

    try {
      // Simulate progress steps while waiting for response
      const progressInterval = setInterval(() => {
        setProcessingStep(prevStep => {
          // Don't exceed the number of steps
          const nextStep = prevStep + 1;
          if (nextStep >= processingSteps.length) {
            return prevStep;
          }
          setProcessingStepName(processingSteps[nextStep]);
          return nextStep;
        });
      }, 800); // Advance every 800ms
      
      // Use the existing POST endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: text,
          use_llm: localUseLlm,
          model: selectedModel,
        }),
      });

      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      // Create final message
      const finalMessages = [
        ...newMessages,
        {
          type: "bot",
          content: {
            recipes: data,
            title: "Recipe Recommendations",
            isGrouped: true
          }
        }
      ];

        setMessages(finalMessages);
        setLoading(false);

        // Save to Firebase
        if (userId) {
          saveChat(finalMessages, text);
        }
    } catch (error) {
      console.error("Error:", error);

      // Create error messages array
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
            ) : message.content.isGrouped ? (
              <Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',                         // 1 column on small screens
                      sm: 'repeat(2, 1fr)',              // 2 columns on medium screens
                      md: 'repeat(auto-fill, minmax(300px, 1fr))', // Responsive columns on large screens
                    },
                    gap: 3,
                    width: '100%',
                  }}
                >
                  {message.content.recipes.map((recipe, recipeIndex) => (
                    <Box key={recipeIndex}>
                      {renderRecipeCard(recipe)}
                    </Box>
                  ))}
                </Box>
              </Box>
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
      <Card
        elevation={2}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
          ...(isLlmCard && {
            bgcolor: darkMode
              ? "rgba(66, 165, 245, 0.05)"
              : "rgba(30, 136, 229, 0.03)",
            borderLeft: "4px solid",
            borderColor: "primary.main",
          }),
        }}
      >
          {recipe.img_url && !isLlmCard && (
          <Box sx={{ position: 'relative', height: 0, paddingTop: '56.25%' }}>
            <CardMedia
              component="img"
              image={recipe.img_url}
              alt={recipe.title}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Optional overlay gradient for better title readability if placed on image */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '30%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                p: 2,
              }}
            />
          </Box>
        )}

        <CardContent sx={{ 
          p: 3, 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column'
        }}>
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{ 
              mb: 2,
              fontWeight: 700,
              color: isLlmCard ? 'primary.main' : 'text.primary'
            }}
          >
            {recipe.title}
          </Typography>

          {!isLlmCard && (
            <Box sx={{ 
              display: "flex", 
              flexWrap: "wrap", 
              gap: 1.5, 
              mb: 3, 
              mt: 1 
            }}>
              {recipe.Time && (
                <Chip
                  icon={<AccessTimeIcon fontSize="small" />}
                  label={recipe.Time}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    borderRadius: 1.5,
                    '& .MuiChip-icon': { 
                      color: darkMode ? 'primary.light' : 'primary.main' 
                    },
                    fontWeight: 500 
                  }}
                />
              )}
              {recipe.Calories && (
                <Chip
                  icon={<LocalFireDepartmentIcon fontSize="small" />}
                  label={`${recipe.Calories}`}
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ 
                    borderRadius: 1.5, 
                    '& .MuiChip-icon': { 
                      color: darkMode ? 'error.light' : 'error.main' 
                    },
                    fontWeight: 500 
                  }}
                />
              )}
              {recipe.Protein && (
                <Chip
                  icon={<FitnessCenterIcon fontSize="small" />}
                  label={`${recipe.Protein} Protein`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ 
                    borderRadius: 1.5, 
                    '& .MuiChip-icon': { 
                      color: darkMode ? 'success.light' : 'success.main'
                    },
                    fontWeight: 500 
                  }}
                />
              )}
              {recipe.Sub_region && (
                <Chip
                  icon={<PublicIcon fontSize="small" />}
                  label={recipe.Sub_region}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ 
                    borderRadius: 1.5, 
                    '& .MuiChip-icon': { 
                      color: darkMode ? 'secondary.light' : 'secondary.main'
                    },
                    fontWeight: 500
                  }}
                />
              )}
            </Box>
          )}

          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2, 
              flexGrow: 1,
              lineHeight: 1.6,
              fontSize: '0.95rem'
            }} 
          >
            {recipe.description}
          </Typography>

          {isLlmCard && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1, 
              mt: 1, 
              color: 'primary.main' 
            }}>
              <SmartToyIcon fontSize="small" />
              <Typography variant="caption" fontWeight={500}>
                AI-Generated Response
              </Typography>
            </Box>
          )}
        </CardContent>

          {!isLlmCard && (
          <CardActions sx={{ 
            p: 3, 
            pt: 0, 
            gap: 2,
            justifyContent: 'flex-start' 
          }}>
              {recipe.url && (
                <Button
                  variant="outlined"
                  href={recipe.url}
                  target="_blank"
                  rel="noopener"
                startIcon={<MenuBookIcon />}
                size="medium"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  height: 40,
                  fontSize: '0.875rem',
                }}
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
                startIcon={<YouTubeIcon />}
                size="medium"
                color="primary"
                  sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  height: 40,
                  fontSize: '0.875rem',
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    },
                  }}
                >
                Watch Video
                </Button>
              )}
          </CardActions>
        )}
      </Card>
    );
  };

  // Updated loading indicator to use real progress information
  const renderLoadingIndicator = () => (
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
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 600 }}>
                {processingStepName || processingSteps[processingStep] || "Processing..."}
              </Typography>
              
              <LinearProgress 
                variant="determinate" 
                value={(processingStep + 1) / processingSteps.length * 100} 
                sx={{ 
                  mb: 2,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {processingSteps.map((step, index) => (
                  <Chip
                    key={index}
                    label={step}
                    size="small"
                    variant={index <= processingStep ? "filled" : "outlined"}
                    color={index <= processingStep ? "primary" : "default"}
                    sx={{ 
                      opacity: index <= processingStep ? 1 : 0.5,
                      fontSize: '0.75rem',
                    }}
                  />
                ))}
              </Box>
            </Box>

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
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
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
          "&::-webkit-scrollbar": {
            width: "10px",
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
          },
          "&::-webkit-scrollbar-thumb": {
            background: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
            borderRadius: "10px",
            transition: 'background 0.2s',
            "&:hover": {
              background: darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'
            }
          },
          scrollbarWidth: "thin",
          scrollbarColor: darkMode ? 
            'rgba(255,255,255,0.15) rgba(255,255,255,0.05)' : 
            'rgba(0,0,0,0.15) rgba(0,0,0,0.03)',
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              maxWidth: "800px",
              width: "100%",
              margin: "0 auto",
              pt: { xs: 4, md: 8 },
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              animation: "fadeIn 0.8s ease-out",
              "@keyframes fadeIn": {
                "0%": { opacity: 0, transform: "translateY(20px)" },
                "100%": { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <Box 
              component="img"
              src="/images/gastro-genie-icon-1024-1024.png"
              alt="GastroGenie Logo"
              sx={{
                width: { xs: 80, md: 120 },
                height: { xs: 80, md: 120 },
                mb: 3,
                filter: "drop-shadow(0 4px 12px rgba(76, 175, 80, 0.3))",
                animation: "float 3s ease-in-out infinite",
                "@keyframes float": {
                  "0%": { transform: "translateY(0px)" },
                  "50%": { transform: "translateY(-10px)" },
                  "100%": { transform: "translateY(0px)" },
                },
              }}
            />
            
            <Typography 
              variant="h1" 
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2rem", md: "3rem" },
                mb: 2,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "primary.main", // Fallback
                letterSpacing: "-0.5px",
                textShadow: "0 4px 12px rgba(0,0,0,0.07)",
              }}
            >
              Your Personal Culinary Assistant
            </Typography>
            
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ 
                mb: 5, 
                maxWidth: "600px", 
                mx: "auto",
                fontSize: { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.6,
                letterSpacing: "0.2px",
                fontWeight: 400,
              }}
            >
              Discover recipes, get cooking advice, and find meal ideas tailored
              to your preferences and dietary needs.
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                bgcolor: (theme) => 
                  theme.palette.mode === "dark" 
                    ? "rgba(255,255,255,0.03)" 
                    : "rgba(0,0,0,0.01)",
                border: "1px solid",
                borderColor: "divider", 
                width: "100%",
                mb: 5,
                position: "relative",
                overflow: "hidden",
                backdropFilter: "none", // Remove blur which can cause edge artifacts
              }}
            >
              <Typography 
                variant="h2" 
                gutterBottom 
                sx={{ 
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "primary.main",
                  mb: 3,
                }}
              >
                Try these suggestions:
              </Typography>
              
              <Box
                className="suggestion-carousel"
                sx={{
                  overflow: "hidden",
                  position: "relative",
                  height: "auto",
                  mb: 1,
                  px: 0.5,
                  "&:hover .carousel-row": {
                    animationPlayState: "paused !important",
                  },
                  "&::before, &::after": {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    width: 60,
                    height: '100%',
                    zIndex: 1,
                    pointerEvents: 'none',
                  },
                  "&::before": {
                    left: 0,
                    background: (theme) => `linear-gradient(to right, ${
                      theme.palette.mode === "dark" 
                        ? "rgba(18,18,18,1)" 
                        : "rgba(250,250,250,1)"
                    } 0%, transparent 100%)`,
                  },
                  "&::after": {
                    right: 0,
                    background: (theme) => `linear-gradient(to left, ${
                      theme.palette.mode === "dark" 
                        ? "rgba(18,18,18,1)" 
                        : "rgba(250,250,250,1)"
                    } 0%, transparent 100%)`,
                  }
                }}
              >
                {/* Create three separate rows with alternating directions */}
                {suggestionRows.map((row, rowIndex) => {
                  // Store animation value as a separate variable
                  const animationName = rowIndex % 2 === 0 ? 'scrollLeft' : 'scrollRight';
                  const animationDuration = 150 + (rowIndex * 20);
                  
                  return (
                    <Box
                      key={`row-${rowIndex}`}
                      className="carousel-row" // Add a class to target with CSS
                      sx={{
                        display: 'flex',
                        width: 'max-content',
                        my: 1.25,
                        animation: `${animationName} ${animationDuration}s linear infinite`,
                        "@keyframes scrollLeft": {
                          "0%": { transform: 'translateX(0)' },
                          "100%": { transform: 'translateX(calc(-100% / 2))' },
                        },
                        "@keyframes scrollRight": {
                          "0%": { transform: 'translateX(calc(-100% / 2))' },
                          "100%": { transform: 'translateX(0)' },
                        },
                      }}
                    >
                      {/* First set of suggestions */}
                      {row.map((suggestion, index) => {
                        // Calculate the vertical offset once
                        const yOffset = Math.sin(index * 2) * 4;
                        return (
                          <Chip
                            key={`chip-${rowIndex}-${index}`}
                            label={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            sx={{
                              borderRadius: "16px",
                              py: 1.5,
                              px: 1.5,
                              mx: 0.5, // Reduced horizontal margin
                              bgcolor: "background.paper",
                              border: "1px solid",
                              borderColor: "divider",
                              fontSize: "0.9rem",
                              fontWeight: 500,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              transform: `translateY(${yOffset}px)`,
                              transition: "all 0.2s ease, transform 0s", // Don't animate transform changes
                              whiteSpace: "nowrap",
                              "&:hover": {
                                bgcolor: "primary.main",
                                color: "white",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                // Keep the same vertical offset when hovering
                                transform: `translateY(${yOffset}px)`,
                              },
                            }}
                          />
                        );
                      })}
                      
                      {/* Duplicate for seamless loop */}
                      {row.map((suggestion, index) => {
                        // Use the same vertical offset calculation for duplicates
                        const yOffset = Math.sin(index * 2) * 4;
                        return (
                          <Chip
                            key={`dup-chip-${rowIndex}-${index}`}
                            label={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            sx={{
                              borderRadius: "16px",
                              py: 1.5,
                              px: 1.5,
                              mx: 0.5, // Reduced horizontal margin
                              bgcolor: "background.paper",
                              border: "1px solid",
                              borderColor: "divider",
                              fontSize: "0.9rem",
                              fontWeight: 500,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              transform: `translateY(${yOffset}px)`,
                              transition: "all 0.2s ease, transform 0s", // Don't animate transform changes
                              whiteSpace: "nowrap",
                              "&:hover": {
                                bgcolor: "primary.main",
                                color: "white",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                // Keep the same vertical offset when hovering
                                transform: `translateY(${yOffset}px)`,
                              },
                            }}
                          />
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ maxWidth: "800px", margin: "0 auto" }}>
            {messages.map((message, index) =>
              renderMessageItem(message, index)
            )}

            {loading && renderLoadingIndicator()}
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
          height: { xs: "60px", md: "130px" }, // Changed from 100px to 124px to match sidebar
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
