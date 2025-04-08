export const loginApi = async (account) => {
  console.log("account", account);

  try {
    const response = await fetch("http://localhost:8081/api/v1/account/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: account.email,
        password: account.password,
      }),
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to register user:", error);
  }
};
