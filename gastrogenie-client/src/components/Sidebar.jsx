// src/components/Sidebar.jsx
import React from 'react';
import { 
  Box, Typography, Switch, FormControlLabel, IconButton, 
  Divider, Tooltip, Avatar, Stack
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import GitHubIcon from '@mui/icons-material/GitHub';

function Sidebar({ darkMode, toggleTheme, useLlm, setUseLlm }) {
  return (
    <Box
      sx={{
        width: { xs: '70px', md: '260px' },
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        zIndex: 10,
        transition: 'width 0.5s ease',
        overflow: 'hidden', // Prevent content from spilling out
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <RestaurantMenuIcon color="primary" sx={{ fontSize: 28 }} />
        <Typography
          variant="h1"
          sx={{
            display: { xs: 'none', md: 'block' },
            color: 'primary.main',
          }}
        >
          GastroGenie
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ p: 2, display: { xs: 'none', md: 'block' } }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Your AI-powered culinary companion that helps you discover delicious recipes tailored to your preferences.
        </Typography>
      </Box>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton onClick={toggleTheme} size="small">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Mobile view - Stacked layout */}
        <Box 
          sx={{ 
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}
        >
          <SmartToyIcon fontSize="small" color={useLlm ? "primary" : "action"} />
          <Switch
            checked={useLlm}
            onChange={() => setUseLlm(!useLlm)}
            color="primary"
            size="small"
          />
        </Box>

        {/* Desktop view - Horizontal layout */}
        <FormControlLabel
          control={
            <Switch
              checked={useLlm}
              onChange={() => setUseLlm(!useLlm)}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToyIcon fontSize="small" />
              <Typography variant="body2">
                AI Explanations
              </Typography>
            </Box>
          }
          sx={{ 
            ml: 0, 
            justifyContent: 'center',
            display: { xs: 'none', md: 'flex' } 
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Tooltip title="View on GitHub">
            <IconButton 
              component="a"
              href="https://github.com"
              target="_blank"
              size="small"
              aria-label="github"
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}

export default Sidebar;