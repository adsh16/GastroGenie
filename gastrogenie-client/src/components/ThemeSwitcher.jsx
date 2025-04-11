import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography,
  Tooltip,
  useTheme
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';

const themes = [
  { 
    name: 'Green Garden', 
    primary: '#4CAF50', 
    secondary: '#FF9800',
    preview: [
      { bgcolor: '#4CAF50', flex: 3 },
      { bgcolor: '#FF9800', flex: 1 } 
    ]
  },
  { 
    name: 'Ocean Blue', 
    primary: '#2196F3', 
    secondary: '#00BCD4',
    preview: [
      { bgcolor: '#2196F3', flex: 3 },
      { bgcolor: '#00BCD4', flex: 1 } 
    ]
  },
  { 
    name: 'Royal Purple', 
    primary: '#673AB7', 
    secondary: '#E91E63',
    preview: [
      { bgcolor: '#673AB7', flex: 3 },
      { bgcolor: '#E91E63', flex: 1 } 
    ]
  },
  { 
    name: 'Sunset Orange', 
    primary: '#FF5722', 
    secondary: '#FFC107',
    preview: [
      { bgcolor: '#FF5722', flex: 3 },
      { bgcolor: '#FFC107', flex: 1 } 
    ]
  }
];

function ThemeSwitcher({ currentTheme, onThemeChange, darkMode }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleThemeSelect = (themeIndex) => {
    onThemeChange(themeIndex);
    handleClose();
  };
  
  return (
    <>
      <Tooltip title="Change Theme">
        <IconButton 
          onClick={handleClick}
          sx={{ 
            color: 'white',
            bgcolor: 'primary.main',
            '&:hover': { 
              bgcolor: 'primary.dark' 
            },
            position: 'fixed',
            right: '20px',
            bottom: '130px',
            zIndex: 1000,
            boxShadow: 3,
          }}
        >
          <PaletteIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{ 
          '& .MuiPaper-root': { 
            borderRadius: 2, 
            boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.2)',
            bgcolor: darkMode ? 'background.paper' : 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          } 
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ 
            px: 2, 
            pt: 1,
            pb: 1, 
            fontWeight: 'bold',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          Select Theme
        </Typography>
        
        {themes.map((themeOption, index) => (
          <MenuItem 
            key={themeOption.name} 
            onClick={() => handleThemeSelect(index)}
            selected={currentTheme === index}
            sx={{ 
              px: 2, 
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box 
              sx={{ 
                width: 50, 
                height: 24, 
                borderRadius: 1, 
                overflow: 'hidden',
                display: 'flex',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              {themeOption.preview.map((color, i) => (
                <Box 
                  key={i} 
                  sx={{ 
                    flex: color.flex,
                    bgcolor: color.bgcolor,
                    height: '100%'
                  }} 
                />
              ))}
            </Box>
            <Typography 
              variant="body2"
              sx={{ 
                fontWeight: currentTheme === index ? 'bold' : 'regular',
                color: currentTheme === index ? 'primary.main' : 'text.primary' 
              }}
            >
              {themeOption.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default ThemeSwitcher;