// src/components/Footer.js
import React from 'react';
import { Box, Typography } from '@mui/material';

function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        textAlign: 'center', 
        py: 2, 
        color: 'text.secondary',
        fontSize: '0.9rem'
      }}
    >
      <Typography variant="body2">
        &copy; 2025 GastroGenie | Your AI-Powered Culinary Companion
      </Typography>
    </Box>
  );
}

export default Footer;