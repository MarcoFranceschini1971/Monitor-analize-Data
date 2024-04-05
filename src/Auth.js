import React, { useState } from 'react';
import { styled } from '@mui/system';
import { TextField, Button, Typography, Snackbar } from '@mui/material';
import { Login } from './Firebase';

const RootContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
});

const FormContainer = styled('form')({
  width: '100%',
  maxWidth: 360,
  marginTop: theme => theme.spacing(1),
});

const SubmitButton = styled(Button)({
  margin: theme => theme.spacing(3, 0, 2),
});

const UserAuth = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    Login(email, password, a => onLogin(a.user.uid), err => {
        setError(err.message);
        setOpenSnackbar(true);
      })
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <RootContainer>
      <Typography component="h1" variant="h5">
        Accedi
      </Typography>
      <FormContainer onSubmit={handleLogin}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <SubmitButton
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
        >
          Accedi
        </SubmitButton>
      </FormContainer>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={error}
      />
    </RootContainer>
  );
};

export default UserAuth;
