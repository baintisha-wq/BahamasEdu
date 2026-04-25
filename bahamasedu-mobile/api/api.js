const BASE_URL = "192.168.1.223:5000";

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
};

export const getQuizzes = async (token) => {
  const res = await fetch(`${BASE_URL}/quiz`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};