import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(
          "http://localhost:8081/api/v1/verify-token",
          {
            method: "GET",
            credentials: "include", // important to send cookies
          }
        );

        const data = await response.json();
        console.log("Token verification response:", data);

        if (data?.success === true) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch (err) {
        console.error("Token verification error:", err);
        setIsAuth(false);
      }
    };

    verifyToken();
  }, []);

  if (isAuth === null) return <div>Loading...</div>;
  if (!isAuth) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
