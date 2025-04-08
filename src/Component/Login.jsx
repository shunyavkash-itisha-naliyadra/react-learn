import { useState } from "react";
import "../css/login.css";
import {
  TextField,
  Button,
  Typography,
  Container,
  Avatar,
  Paper,
  Alert,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate, Link } from "react-router-dom";
import { loginApi } from "../utils/login";
import AlertMessage from "../utils/AlertMessage";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);

  const handleLogin = async () => {
    try {
      await loginApi({ email, password });
      setAlert({ message: "Login successful!", type: "success" });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setAlert({
        message: error.response?.data?.message,
        type: "error",
      });
    }
  };
  return (
    <Container component="main" maxWidth="xs" className="position">
      <Paper
        elevation={3}
        sx={{ padding: 3, marginTop: 8, textAlign: "center" }}
      >
        <Avatar sx={{ margin: "auto", bgcolor: "#10672e" }}>
          <LockIcon />
        </Avatar>
        <Typography variant="h5">Login</Typography>
        <TextField
          label="Email"
          name="email"
          type="email"
          color="success"
          fullWidth
          margin="normal"
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          color="success"
          fullWidth
          margin="normal"
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          color="success"
          fullWidth
          onClick={handleLogin}
          className="login-button"
        >
          Login
        </Button>
        <Typography variant="body2" sx={{ marginTop: 2 }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </Typography>
      </Paper>
      {alert && (
        <AlertMessage
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
    </Container>
  );
};

export default Login;
