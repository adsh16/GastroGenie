
import React from 'react';
import { 
  Box, Typography, Card, CardContent, CardMedia, Button,
  Chip, Link
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import RestaurantIcon from '@mui/icons-material/Restaurant';

function RecipeCard({ recipe, darkMode }) {
  const isLlmCard = recipe.is_llm_card;
  
  return (
    <Card
      elevation={0}
      sx={{
        overflow: 'hidden',
        borderRadius: 2,
        mb: 1,
        ...(isLlmCard && {
          bgcolor: darkMode ? 'rgba(66, 165, 245, 0.1)' : 'rgba(30, 136, 229, 0.05)',
          borderLeft: '3px solid',
          borderColor: 'primary.main',
        })
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h2" component="h3" sx={{ mb: 2 }}>
          {recipe.title}
        </Typography>
        
        {recipe.img_url && !isLlmCard && (
          <CardMedia
            component="img"
            image={recipe.img_url}
            alt={recipe.title}
            sx={{
              width: '100%',
              height: 240,
              objectFit: 'cover',
              borderRadius: 1,
              mb: 2,
            }}
          />
        )}
        
        {!isLlmCard && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
            {recipe.Time && (
              <Chip
                icon={<AccessTimeIcon fontSize="small" />}
                label={recipe.Time}
                size="small"
                sx={{ bgcolor: 'background.default' }}
              />
            )}
            {recipe.Calories && (
              <Chip
                icon={<LocalFireDepartmentIcon fontSize="small" />}
                label={`${recipe.Calories} Calories`}
                size="small"
                sx={{ bgcolor: 'background.default' }}
              />
            )}
            {recipe.Protein && (
              <Chip
                icon={<FitnessCenterIcon fontSize="small" />}
                label={`${recipe.Protein}g Protein`}
                size="small"
                sx={{ bgcolor: 'background.default' }}
              />
            )}
            {recipe.Sub_region && (
              <Chip
                label={recipe.Sub_region}
                size="small"
                sx={{ bgcolor: 'background.default' }}
              />
            )}
          </Box>
        )}
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {recipe.description}
        </Typography>
        
        {!isLlmCard && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            {recipe.url && (
              <Button
                variant="outlined"
                startIcon={<RestaurantIcon />}
                component={Link}
                href={recipe.url}
                target="_blank"
                rel="noopener"
                sx={{ borderRadius: 6 }}
              >
                View Recipe
              </Button>
            )}
            
            {recipe.youtube_video && (
              <Button
                variant="contained"
                startIcon={<YouTubeIcon />}
                component={Link}
                href={recipe.youtube_video}
                target="_blank"
                rel="noopener"
                sx={{ 
                  borderRadius: 6,
                  bgcolor: '#ff0000',
                  '&:hover': {
                    bgcolor: '#d32f2f',
                  }
                }}
              >
                Watch Tutorial
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default RecipeCard;