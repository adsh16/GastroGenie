import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Button,
  Tooltip,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PaletteIcon from "@mui/icons-material/Palette";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SpeedIcon from "@mui/icons-material/Speed";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function ChatSidebar({
  chatHistory = [],
  onSelectChat,
  onNewChat,
  currentUser,
  currentChatId,
  darkMode,
  toggleDarkMode,
  currentTheme,
  onThemeChange,
  useLlm,
  onToggleLlm,
  selectedModel,
  onModelChange,
  availableModels = [],
}) {
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Box
      sx={{
        width: { xs: "70px", md: "260px" },
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition:
          "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Branding section */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar
          src="/images/gastro-genie-icon-1024-1024.png"
          alt="GastroGenie"
          sx={{
            width: 60,
            height: 60,
            mb: 1,
            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.2)",
            border: "2px solid",
            borderColor: "primary.main",
          }}
        />
        <Typography
          variant="h6"
          fontWeight="bold"
          color="primary.main"
          align="center"
          sx={{ display: { xs: "none", md: "block" } }}
        >
          GastroGenie
        </Typography>

        <Typography
          variant="caption"
          align="center"
          color="text.secondary"
          sx={{
            mt: 1,
            display: { xs: "none", md: "block" },
            fontSize: "0.75rem",
            lineHeight: 1.4,
          }}
        >
          Your AI-powered culinary companion for discovering recipes and cooking
          advice.
        </Typography>
      </Box>

      <Divider />

      {/* User info section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          overflow: "hidden",
          p: 1.5,
        }}
      >
        <Avatar
          src={currentUser?.photoURL}
          alt={
            currentUser?.displayName?.[0] ||
            currentUser?.email?.[0]?.toUpperCase() ||
            "U"
          }
          sx={{
            border: "3px solid",
            borderColor: "primary.main",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.18)",
            "& img": {
              objectFit: "cover",
            },
          }}
        >
          {currentUser?.displayName?.[0] ||
            currentUser?.email?.[0]?.toUpperCase() ||
            "U"}
        </Avatar>
        <Box
          sx={{
            ml: 1,
            overflow: "hidden",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
              fontSize: "1.1rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentUser?.displayName || "User"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.8rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentUser?.email || ""}
          </Typography>
        </Box>
        <Tooltip title="Sign Out" arrow placement="right">
          <IconButton
            onClick={handleSignOut}
            size="small"
            sx={{
              display: { xs: "none", md: "flex" },
              border: "0.1px solid",
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.06)",
                color: "primary.main",
              },
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      {/* New Chat button */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onNewChat}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            justifyContent: { xs: "center", md: "flex-start" },
            minWidth: { xs: "auto", md: "100%" },
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s ease",
            boxShadow: (theme) => `0 2px 8px ${theme.palette.primary.main}33`,
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background: (theme) => `${theme.palette.primary.light}20`,
              transition: "all 0.4s ease-in-out",
              zIndex: 0,
            },
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: (theme) =>
                `0 4px 12px ${theme.palette.primary.main}40`,
              "& .MuiSvgIcon-root": {
                transform: "rotate(90deg)",
              },
              "&::before": {
                left: "100%",
              },
            },
            "& .MuiSvgIcon-root": {
              transition: "transform 0.3s ease",
              zIndex: 1,
            },
            "& .MuiTypography-root": {
              zIndex: 1,
              position: "relative",
            },
          }}
        >
          <Typography sx={{ display: { xs: "none", md: "block" } }}>
            New Chat
          </Typography>
        </Button>
      </Box>

      <Typography
        variant="subtitle2"
        sx={{
          px: 2,
          py: 1,
          color: "text.secondary",
          display: { xs: "none", md: "block" },
        }}
      >
        Recent Conversations
      </Typography>

      <List sx={{ 
        flex: 1, 
        overflow: "auto",
        "&::-webkit-scrollbar": {
          width: "8px",
          background: "transparent"
        },
        "&::-webkit-scrollbar-thumb": {
          background: "transparent",
          borderRadius: "8px",
          transition: 'background 0.3s ease',
        },
        "&:hover::-webkit-scrollbar-thumb": {
          background: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
        },
        "&:hover::-webkit-scrollbar-thumb:hover": {
          background: darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
        },
        scrollbarWidth: "thin",
        scrollbarColor: "transparent transparent",
        "&:hover": {
          scrollbarColor: darkMode ? 
            'rgba(255,255,255,0.15) transparent' : 
            'rgba(0,0,0,0.15) transparent',
        }
      }}>
        {chatHistory.length > 0 ? (
          chatHistory.map((chat) => (
            <ListItem key={chat.id} disablePadding>
              <ListItemButton
                onClick={() => onSelectChat(chat.id)}
                selected={currentChatId === chat.id}
                sx={{
                  py: 1.5,
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                  px: { xs: 1, md: 2 },
                  ...(currentChatId === chat.id && {
                    bgcolor: "primary.light",
                    color: "primary.contrastText", // Changed from "black" to be theme-aware
                    "&:hover": {
                      bgcolor: "primary.main",
                    },
                    "& .MuiTypography-root": {
                      color: "primary.contrastText", // Changed from "black" to be theme-aware
                    },
                    "& .MuiTypography-colorTextSecondary": {
                      color: "primary.contrastText", // Changed to be more visible in all themes
                      opacity: 0.8, // Add slight opacity for secondary text
                    },
                    borderLeft: "3px solid",
                    borderColor: "primary.dark",
                  }),
                }}
              >
                <ListItemText
                  primary={chat.lastMessage || chat.title || "New Conversation"}
                  secondary={
                    chat.timestamp?.toDate
                      ? new Date(chat.timestamp.toDate()).toLocaleString()
                      : chat.clientTimestamp
                      ? new Date(chat.clientTimestamp).toLocaleString()
                      : "Just now"
                  }
                  primaryTypographyProps={{
                    noWrap: true,
                    fontWeight: "medium",
                    fontSize: "0.9rem",
                    display: { xs: "none", md: "block" },
                  }}
                  secondaryTypographyProps={{
                    noWrap: true,
                    fontSize: "0.75rem",
                    display: { xs: "none", md: "block" },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <Box
            sx={{
              p: 2,
              textAlign: "center",
              display: { xs: "none", md: "block" },
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No previous conversations
            </Typography>
          </Box>
        )}
      </List>

      {/* Settings controls at the bottom */}
      <Box
        sx={{
          mt: "auto",
          height: { xs: "120px", md: "130px" }, // Original height to match text area
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* AI Explanation Toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SmartToyIcon
              fontSize="small"
              color={useLlm ? "primary" : "action"}
              sx={{ display: { xs: "block", md: "block" } }}
            />
            <Typography
              variant="body2"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              AI Explanations
            </Typography>
          </Box>
          <Switch checked={useLlm} onChange={onToggleLlm} size="small" />
        </Box>

        {/* Model Selection - only show when AI is enabled */}
        {useLlm && (
          <Tooltip
            title="Advanced models provide better quality recommendations but may take longer to respond."
            placement="right"
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                pb: 1,
              }}
            >
              <Box sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "center", md: "center" },
                gap: 1, 
                width: "100%" 
              }}>
                <SpeedIcon
                  fontSize="small"
                  color="action"
                  sx={{ display: "block" }}
                />
                <Typography
                  variant="body2"
                  sx={{ display: { xs: "none", md: "block" } }}
                >
                  Model:
                </Typography>
                <Box sx={{ 
                  flexGrow: 1, 
                  minWidth: { xs: "50px", md: "120px" },
                  height: "100%" 
                }}>
                  <Select
                    value={selectedModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    size="small"
                    variant="outlined"
                    fullWidth
                    sx={{
                      fontSize: "0.8rem",
                      ".MuiSelect-select": {
                        py: 0.5,
                        px: { xs: 0.5, md: 1 }
                      }
                    }}
                  >
                    {availableModels.map((model) => (
                      <MenuItem key={model.id} value={model.id}>
                        <Typography noWrap variant="body2">
                          {model.name}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Box>
            </Box>
          </Tooltip>
        )}

        {/* Theme Controls */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            px: 2,
            py: 1.5,
            height: "60px", // Match the input box height
          }}
        >
          {/* Dark Mode Toggle */}
          <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
            <IconButton
              onClick={toggleDarkMode}
              size="small"
              sx={{
                color: darkMode ? "white" : "text.primary",
                bgcolor: darkMode ? "action.selected" : "background.default",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                "& svg": {
                  transition: "transform 0.3s ease",
                  transform: darkMode ? "rotate(180deg)" : "rotate(0deg)",
                },
              }}
            >
              {darkMode ? (
                <LightModeIcon fontSize="small" />
              ) : (
                <DarkModeIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          {/* Theme Picker */}
          <Tooltip title="Change Theme Color">
            <IconButton
              onClick={() => {
                // Cycle through themes
                const nextTheme = (currentTheme + 1) % 4;
                onThemeChange(nextTheme);
              }}
              size="small"
              sx={{
                color: "primary.main",
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <PaletteIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Mobile Sign Out */}
          <IconButton
            onClick={handleSignOut}
            sx={{
              display: { xs: "block", md: "none" },
              color: "text.secondary",
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
            }}
            size="small"
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default ChatSidebar;
