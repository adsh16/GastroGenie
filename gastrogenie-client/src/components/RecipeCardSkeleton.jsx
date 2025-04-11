import React from 'react';
import { Box, Avatar, Skeleton, Paper } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

function RecipeCardSkeleton({ useLlm = false }) {
  return (
    <Box sx={{ animation: 'pulse 1.5s infinite' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36 }}>
          <RestaurantMenuIcon />
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
          
          <Paper
            elevation={0}
            sx={{
              overflow: 'hidden',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              p: { xs: 2, sm: 3 },
              ...(useLlm && {
                borderLeft: '3px solid',
                borderColor: 'primary.main',
              })
            }}
          >
            <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
            
            {!useLlm && (
              <Skeleton
                variant="rectangular"
                width="100%"
                height={200}
                sx={{ borderRadius: 1, mb: 2 }}
              />
            )}
            
            {!useLlm && (
              <Box sx={{ display: 'flex', gap: 1, my: 2, flexWrap: 'wrap' }}>
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
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Skeleton variant="rounded" width={120} height={36} />
                <Skeleton variant="rounded" width={150} height={36} />
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default RecipeCardSkeleton;