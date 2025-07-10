import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';

export const DiscordCallback = () => {
  const { handleDiscordCallback } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');

      if (code) {
        try {
          await handleDiscordCallback(code);
          navigate('/');
        } catch (error) {
          console.error('Discord authentication failed', error);
          navigate('/'); // Redirect to home on failure
        }
      } else {
        navigate('/'); // No code, redirect home
      }
    };

    handleAuth();
  }, [handleDiscordCallback, location.search, navigate]);

  return <LoadingScreen />;
};