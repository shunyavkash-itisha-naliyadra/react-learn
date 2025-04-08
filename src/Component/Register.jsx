import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import "../css/login.css";
import {
  TextField,
  Button,
  Typography,
  Container,
  Avatar,
  Paper,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate, Link } from "react-router-dom";
import { registerApi } from "../utils/Register";
import AlertMessage from "../utils/AlertMessage";

const Register = () => {
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      phone: "",
      profilePhoto: null,
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First Name is required"),
      lastName: Yup.string().required("Last Name is required"),
      userName: Yup.string().required("Username is required"),
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      phone: Yup.string()
        .matches(/^\d{10}$/, "Phone number must be 10 digits")
        .required("Phone number is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formDataToSend = new FormData();
        Object.keys(values).forEach((key) => {
          formDataToSend.append(key, values[key]);
        });

        let response = await registerApi(values);
        if (response.success == true) {
          setAlert({
            message: "Registration successful! Please login.",
            type: "success",
          });
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
        setAlert({
          message: response?.errors[0]?.message,
          type: "error",
        });
      } catch (error) {
        setAlert({
          message: error.response?.message || "Registration failed",
          type: "error",
        });
      }
      setSubmitting(false);
    },
  });
  return (
    <Container component="main" maxWidth="xs" className="position">
      <Paper
        elevation={3}
        sx={{ padding: 3, marginTop: 8, textAlign: "center" }}
      >
        <Avatar sx={{ margin: "auto", bgcolor: "#10672e" }}>
          <LockIcon />
        </Avatar>
        <Typography variant="h4">Register</Typography>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            label="First Name"
            name="firstName"
            fullWidth
            color="success"
            margin="normal"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.firstName}
          />
          {formik.touched.firstName && formik.errors.firstName && (
            <div className="error">{formik.errors.firstName}</div>
          )}

          <TextField
            label="Last Name"
            name="lastName"
            fullWidth
            color="success"
            margin="normal"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.lastName}
          />
          {formik.touched.lastName && formik.errors.lastName && (
            <div className="error">{formik.errors.lastName}</div>
          )}

          <TextField
            label="Username"
            name="userName"
            fullWidth
            color="success"
            margin="normal"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.userName}
          />
          {formik.touched.userName && formik.errors.userName && (
            <div className="error">{formik.errors.userName}</div>
          )}

          <TextField
            label="Email"
            name="email"
            color="success"
            fullWidth
            margin="normal"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="error">{formik.errors.email}</div>
          )}

          <TextField
            type="password"
            label="Password"
            name="password"
            color="success"
            fullWidth
            margin="normal"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="error">{formik.errors.password}</div>
          )}

          <TextField
            label="Phone"
            name="phone"
            fullWidth
            color="success"
            margin="normal"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.phone}
          />
          {formik.touched.phone && formik.errors.phone && (
            <div className="error">{formik.errors.phone}</div>
          )}

          <input
            type="file"
            name="profilePhoto"
            accept="image/*"
            className="input-file"
            onChange={(event) =>
              formik.setFieldValue("profilePhoto", event.currentTarget.files[0])
            }
          />
          {formik.errors.profilePhoto && (
            <div className="error">{formik.errors.profilePhoto}</div>
          )}

          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Registering..." : "Register"}
          </Button>
        </form>
        <Typography variant="body2" sx={{ marginTop: 2 }}>
          Already have an account? <Link to="/login">Login here</Link>
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

export default Register;
