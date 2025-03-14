import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, InputBase, Menu, MenuItem, Avatar, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useTrack } from '../contexts/trackcontext';
import { useUser } from '../contexts/usercontext';

const Navbar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const logout = useAuthStore((state) => state.logout);
  const { setCurrentTrack, setIsPlaying } = useTrack();
  const { user, logoutUser, userProfile } = useUser();
  const navigate = useNavigate();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ boxShadow: 'none' }}>
      <Toolbar>
        <Box>
          <Typography variant="h6" noWrap component="div">
            <Link to="/feed" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img src="https://bgceohesbgirgijwxbhn.supabase.co/storage/v1/object/public/jamcore-static//jamcorelogo.png" alt="Logo" style={{ width: 'auto', height: '30px' }} />
            </Link>
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 2, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 1, p: '2px 4px' }}>
            <InputBase placeholder="pesquisar" inputProps={{ 'aria-label': 'search' }} sx={{ ml: 1, flex: 1 }} />
            <IconButton type="submit" aria-label="search">
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>

        <Box>
          <Link to="/upload" style={{ color: 'inherit', textDecoration: 'none' }}>
            <IconButton color="inherit" aria-label="upload">
              <Typography display="block">criar jam</Typography>
            </IconButton>
          </Link>
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
