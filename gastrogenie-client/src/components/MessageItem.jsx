
import React from 'react';
import { Box, Avatar, Typography, Divider } from '@mui/material';
import RecipeCard from './RecipeCard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PersonIcon from '@mui/icons-material/Person';

function MessageItem({ message, darkMode }) {
  const isUser = message.type === 'user';
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        my: 4,
        borderBottom: message.type === 'bot' ? `1px solid` : 'none',
        borderColor: 'divider',
        pb: message.type === 'bot' ? 4 : 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: isUser ? 'primary.dark' : 'primary.light',
            width: 36,
            height: 36,
          }}
        >
          {isUser ? <PersonIcon /> : <RestaurantMenuIcon />}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: isUser ? 'primary.main' : 'text.primary',
            }}
          >
            {isUser ? 'You' : 'GastroGenie'}
          </Typography>
          
          {isUser ? (
            <Typography variant="body1">{message.content}</Typography>
          ) : (
            <RecipeCard recipe={message.content} darkMode={darkMode} />
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default MessageItem;