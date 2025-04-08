export const registerApi = async (account) => {
  try {
    const formData = new FormData();
    Object.keys(account).forEach((key) => {
      formData.append(key, account[key]);
    });
    const response = await fetch("http://localhost:8081/api/v1/account", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to register user:", error);
  }
};
