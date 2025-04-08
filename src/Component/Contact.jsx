import React, { useState } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Dialog,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import AlertMessage from "../utils/AlertMessage";
import { registerApi } from "../utils/Register";
export default function ContactDialog({ open, onClose, onSubmit }) {
  const [alert, setAlert] = useState(null);

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
    onSubmit: async (values, { setSubmitting, resetForm }) => {
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
            resetForm();
            onClose(false);
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
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add Contact</DialogTitle>
        <DialogContent>
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
              error={
                formik.touched.firstName && Boolean(formik.errors.firstName)
              }
              helperText={formik.touched.firstName && formik.errors.firstName}
            />

            <TextField
              label="Last Name"
              name="lastName"
              fullWidth
              color="success"
              margin="normal"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.lastName}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />

            <TextField
              label="Username"
              name="userName"
              fullWidth
              color="success"
              margin="normal"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.userName}
              error={formik.touched.userName && Boolean(formik.errors.userName)}
              helperText={formik.touched.userName && formik.errors.userName}
            />

            <TextField
              label="Email"
              name="email"
              fullWidth
              color="success"
              margin="normal"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              type="password"
              label="Password"
              name="password"
              fullWidth
              color="success"
              margin="normal"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />

            <TextField
              label="Phone"
              name="phone"
              fullWidth
              color="success"
              margin="normal"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />

            <input
              type="file"
              name="profilePhoto"
              accept="image/*"
              className="input-file"
              onChange={(event) =>
                formik.setFieldValue(
                  "profilePhoto",
                  event.currentTarget.files[0]
                )
              }
            />
            {formik.errors.profilePhoto && (
              <div className="error">{formik.errors.profilePhoto}</div>
            )}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={formik.isSubmitting}
            onClick={formik.handleSubmit}
          >
            {formik.isSubmitting ? "Saving..." : "Save"}
          </Button>
          {alert && (
            <AlertMessage
              message={alert.message}
              type={alert.type}
              onClose={() => setAlert(null)}
            />
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
