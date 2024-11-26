import { useState } from 'react';
import { Typography, Grid, Button, TextField } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import { SignInContainer, SignInPageContainer } from "./styles";

const SignIn = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(credentials);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        }
    };

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    return (
        <SignInPageContainer>
            <SignInContainer>
                <form onSubmit={handleSubmit}>
                    <Grid container direction="column" justifyContent="center" alignItems="center" spacing={4}>
                        <Grid item pt={6}>
                            <Typography variant="h4" color="primary">Sign In</Typography>
                        </Grid>

                        <Grid item>
                            <TextField
                                name="email"
                                placeholder="Email"
                                value={credentials.email}
                                onChange={handleChange}
                                fullWidth
                                sx={{ width: 300 }}
                            />
                        </Grid>

                        <Grid item>
                            <TextField
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={credentials.password}
                                onChange={handleChange}
                                fullWidth
                                sx={{ width: 300 }}
                            />
                        </Grid>

                        {error && (
                            <Grid item>
                                <Typography color="error">{error}</Typography>
                            </Grid>
                        )}

                        <Grid item>
                            <Button
                                type="submit"
                                variant="contained"
                                color="action"
                                size="large"
                                sx={{ width: 194, height: 62, borderRadius: 5, textTransform: "none" }}
                            >
                                <Typography variant="h5" color="white">
                                    Login
                                </Typography>
                            </Button>
                        </Grid>

                        <Grid item>
                            <Typography variant="body1" color="primary" align="center">
                                If you do not have an account please contact your supervisor
                            </Typography>
                        </Grid>
                    </Grid>
                </form>
            </SignInContainer>
        </SignInPageContainer>
    );
};

export default SignIn;