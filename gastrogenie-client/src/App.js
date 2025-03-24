import React, { useState, useEffect } from 'react';
import { ThemeProvider, Box, CssBaseline } from '@mui/material';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { lightTheme, darkTheme } from './theme';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [useLlm, setUseLlm] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('theme', darkMode ? 'light' : 'dark');
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar darkMode={darkMode} toggleTheme={toggleTheme} useLlm={useLlm} setUseLlm={setUseLlm} />
        <ChatArea darkMode={darkMode} useLlm={useLlm} />
      </Box>
    </ThemeProvider>
  );
}

export default App;