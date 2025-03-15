import React, { useState, useRef, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, InputBase, Menu, MenuItem, Avatar, Box, useMediaQuery, Theme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearchClick = () => {
    setShowSearch(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <AppBar position="fixed" sx={{ boxShadow: 'none' }}>
      <Toolbar sx={{ justifyContent: 'space-between', height: '64px' }}>
        {!showSearch && (
          <Box>
            <Typography variant="h6" noWrap component="div">
              <Link to="/feed" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <img src="https://bgceohesbgirgijwxbhn.supabase.co/storage/v1/object/public/jamcore-static//jamcorelogo.png" alt="Logo" style={{ width: 'auto', height: '30px' }} />
              </Link>
            </Typography>
          </Box>
        )}

        {showSearch && (
          <Box ref={searchRef} sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mx: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 1, p: '2px 4px', width: '100%', maxWidth: '400px' }}>
              <InputBase placeholder="pesquisar" inputProps={{ 'aria-label': 'search' }} sx={{ ml: 1, flex: 1 }} />
            </Box>
          </Box>
        )}

        {!isMobile && (
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mx: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 1, p: '2px 4px', width: '100%', maxWidth: '400px' }}>
              <InputBase placeholder="pesquisar" inputProps={{ 'aria-label': 'search' }} sx={{ ml: 1, flex: 1 }} />
              <IconButton type="submit" aria-label="search">
                <SearchIcon />
              </IconButton>
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <IconButton color="inherit" aria-label="search" onClick={handleSearchClick}>
              <SearchIcon />
            </IconButton>
          )}

          {!showSearch && (
            <Link to="/upload" style={{ color: 'inherit', textDecoration: 'none' }}>
              <IconButton color="inherit" aria-label="upload">
                <Typography display="block">criar jam</Typography>
              </IconButton>
            </Link>
          )}

          <IconButton
            color="inherit"
            aria-label="profile"
            aria-controls="profile-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
          >
            <Avatar
              alt={user?.username || 'você'}
              src={user?.profilePictureUrl || userProfile?.profilePictureUrl || '/default-avatar.png'}
            />
          </IconButton>
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {user ? <MenuItem>{user.username}</MenuItem> : null}
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>perfil</MenuItem>
            <MenuItem onClick={() => { setIsPlaying(false); setCurrentTrack(null); logout(); logoutUser(); handleMenuClose(); }}>sair</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;