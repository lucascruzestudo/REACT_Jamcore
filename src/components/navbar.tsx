import React, { useState, useRef, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, InputBase, Menu, MenuItem, Avatar, Box, useMediaQuery, Theme, Button, Divider, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useTrack } from '../contexts/trackcontext';
import { useUser } from '../contexts/usercontext';

const Navbar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const logout = useAuthStore((state) => state.logout);
  const { setCurrentTrack, setIsPlaying } = useTrack();
  const { user, logoutUser, userProfile } = useUser();
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarSrc = userProfile?.profilePictureUrl && userProfile?.updatedAt
    ? `${userProfile.profilePictureUrl}?t=${userProfile.updatedAt}`
    : user?.profilePictureUrl || '/jamcoredefaultpicture.jpg';

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#fff',
        color: '#1a1a1a',
        boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', height: '60px', gap: 1 }}>
        {/* Logo */}
        {!showSearch && (
          <Link to="/feed" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img src="/jamcorelogored.png" alt="jamcore" style={{ height: '26px', width: 'auto' }} />
          </Link>
        )}

        {/* Search bar - always visible on desktop */}
        {!isMobile && (
          <Box
            sx={{
              flexGrow: 1,
              mx: 2,
              maxWidth: 380,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '10px',
              px: 1.5,
              py: 0.5,
              border: '1px solid rgba(0,0,0,0.04)',
              transition: 'border 0.18s',
              '&:focus-within': { border: '1px solid rgba(233,52,52,0.16)' },
            }}
          >
            <SearchIcon sx={{ fontSize: 18, color: '#9aa0a6', mr: 0.5 }} />
            <InputBase
              placeholder="pesquisar jams..."
              inputProps={{ 'aria-label': 'search' }}
              sx={{ flex: 1, fontSize: '0.88rem', color: '#333', '& ::placeholder': { color: '#9aa0a6' } }}
            />
          </Box>
        )}

        {/* Mobile search expand */}
        {isMobile && showSearch && (
          <Box
            ref={searchRef}
                sx={{
                  flexGrow: 1,
                  mx: 1,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '10px',
                  px: 1.5,
                  py: 0.5,
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
          >
                <SearchIcon sx={{ fontSize: 18, color: '#9aa0a6', mr: 0.5 }} />
                <InputBase
                  placeholder="pesquisar jams..."
                  inputProps={{ 'aria-label': 'search' }}
                  sx={{ flex: 1, fontSize: '0.88rem', color: '#333', '& ::placeholder': { color: '#9aa0a6' } }}
                  autoFocus
                />
          </Box>
        )}

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {isMobile && !showSearch && (
            <IconButton size="small" onClick={() => setShowSearch(true)}>
              <SearchIcon sx={{ fontSize: 20, color: '#555' }} />
            </IconButton>
          )}

          {!showSearch && (
            <Button
              component={Link}
              to="/track/create"
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                py: 0.6,
                px: { xs: 1.2, sm: 1.8 },
                boxShadow: 'none',
                backgroundColor: '#E93434',
                color: '#fff',
                border: '1px solid rgba(233,52,52,0.16)',
                '&:hover': { backgroundColor: '#c62828' },
              }}
            >
              {!isMobile ? 'criar jam' : ''}
            </Button>
          )}

          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ ml: 0.5 }}
          >
            <Avatar
              alt={user?.username || ''}
              src={avatarSrc}
              sx={{ width: 34, height: 34, borderRadius: '8px', border: '1.5px solid rgba(0,0,0,0.08)' }}
            />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                minWidth: 160,
                '& .MuiMenuItem-root': {
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  mx: 0.5,
                  my: 0.25,
                },
              },
            }}
          >
            {user && (
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>logado como</Typography>
                <Typography variant="body2" fontWeight={600}>{user.username}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={() => { handleMenuClose(); navigate('/user/' + user?.id); }}>meu perfil</MenuItem>
            <MenuItem
              onClick={() => { setIsPlaying(false); setCurrentTrack(null); logout(); logoutUser(); handleMenuClose(); }}
              sx={{ color: '#E93434 !important' }}
            >
              sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
