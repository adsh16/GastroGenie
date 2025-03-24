import React from 'react';
import { Box, Typography, IconButton, Container } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import './Header.css';

function Header({ darkMode, toggleTheme }) {
  return (
    <Container>
      <Box sx={{ position: 'relative', textAlign: 'center', py: 4 }}>
        <IconButton
          onClick={toggleTheme}
          sx={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            bgcolor: 'background.paper',
            width: { xs: '36px', sm: '46px' },
            height: { xs: '36px', sm: '46px' },
            boxShadow: 3,
            border: '1px solid',
            borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          }}
        >
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        <Box className="logo-container" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <img 
            src="https://www.foodoscope.com/static/media/logo.729a9d4d1d20e9d2fdc9.png" 
            alt="GastroGenie Logo" 
            className="logo"
            style={{ width: '60px', marginRight: '1rem' }}
          />
          <Typography 
            variant="h1" 
            component="h1" 
            className="gradient-text"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
              letterSpacing: '-0.5px',
              mb: 0.5,
            }}
          >
            GastroGenie
          </Typography>
        </Box>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.9rem', sm: '1.1rem' },
            fontWeight: 400,
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          Your AI-Powered Culinary Companion
        </Typography>
      </Box>
    </Container>
  );
}

export default Header;