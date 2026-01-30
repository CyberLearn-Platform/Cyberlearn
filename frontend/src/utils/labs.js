import { apiEndpoints } from "../config";

export async function startLab(username) {
  const res = await fetch(apiEndpoints.labs.start, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Start lab error:", text);
    throw new Error(text);
  }

  return res.json();
}

export async function submitFlag(flag) {
  const res = await fetch(apiEndpoints.labs.submitFlag, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ flag }),
  });

  return res.json();
}
