"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  styled,
  alpha,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  LockReset,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useRouter } from "next/navigation";

const Root = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.light,
    0.1
  )} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(3),
}));

/* AuthCard: no border radius, no shadow, fixed size per request */
const AuthCard = styled(Card)(() => ({
  width: 300,
  height: 480,
  borderRadius: 0,
  boxShadow: "none",
  overflowY: 'auto'
}));

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const API = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);

    try {
     
      const res = await fetch(`${API}/api/auth/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      }); 
      const authData = await res.json();

      if (!res.ok) {
        setError(authData.error?.message || "Email ou mot de passe invalide.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", authData.jwt);

      const userRes = await fetch(`${API}/api/users/me?populate=role`, {
        headers: { Authorization: `Bearer ${authData.jwt}` },
      });
      const userData = await userRes.json();

      if (!userRes.ok) {
        setError("'Impossible de récupérer les informations de l'utilisateur");
        setLoading(false);
        return;
      }

      const roleName = userData.role?.name;
      setTimeout(() => {
        if (roleName === "doctor") router.push("/doctor");
        else if (roleName === "public") router.push("/public");
        else if (roleName === "admin") router.push("/admin");
      }, 0);
    } catch (err) {
      setError("Erreur de connexion au serveur.");
      setLoading(false);
    }
  };

  return (
    <Root>
      {/* صف مركزي بلا فراغ بين العناصر (gap: 0) */}
      <Box sx={{ display: "flex", flexDirection: "row", gap: 0, alignItems: "center", justifyContent: "center", boxShadow: theme.shadows[5], backgroundColor: '#fff' }}>
        {/* بطاقة المصادقة (form) */}
        <AuthCard>
          <CardContent sx={{ p: 4,  height: "100%", boxSizing: "border-box" }}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <DotLottieReact
                src="https://lottie.host/b16ac9e9-c198-41ff-9592-03cd4fe72562/OiXbqMHDnc.lottie"
                autoplay
                loop
                style={{ height: 100 , width: "100%", margin: "0 auto" }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600, mt: 1, color: 'success' }}>
                Bienvenue !
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connectez-vous pour continuer
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate aria-busy={loading ? "true" : "false"}>
              <fieldset disabled={loading} style={{ border: "none", padding: 0, margin: 0 }}>
                <TextField
                  fullWidth
                  label="Votre identifiant"
                  variant="outlined"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Mot de passe"
                  type={showPassword ? "text" : "password"}
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockReset color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  color="success"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    py: 1.2,
                    borderRadius: 1,
                    fontSize: "0.95rem",
                    minHeight: 44,
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : "Se connecter"}
                </Button>

                <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  
                </Box>
              </fieldset>

              {showForgot && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Veuillez contacter l'administration pour réinitialiser votre mot de passe.
                </Alert>
              )}
            </Box>
          </CardContent>
        </AuthCard>

        <Box
          component="img"
          src="https://preview.redd.it/french-and-moroccan-soldiers-during-exercise-chergui-2022-v0-5520hwmqu1k91.jpg?width=640&crop=smart&auto=webp&s=2b20b317e85e27193b1d1b44e90a2fb65a59414e"
          alt="Army"
          sx={{
            width: 300,
            height: 480,
            objectFit: "cover",
            borderRadius: 0,
            boxShadow: "none",
            display: "block",
          
          }}
        />
      </Box>
    </Root>
  );
}
