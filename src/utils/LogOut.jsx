export const logOutApi = async () => {
  try {
    const response = await fetch(
      "http://localhost:8081/api/v1/account/log-out",
      {
        method: "POST",
        credentials: "include",
      }
    );
    return response;
  } catch (error) {
    console.error("Logout failed:", error);
    setAlert({ message: "Logout failed. Please try again.", type: "error" });
  }
};
