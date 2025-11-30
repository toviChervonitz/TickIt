export async function googleLoginService(userData: any, token: string) {
  const response = await fetch("/api/googleLogin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({userData, token}),
  });

  return {
    ok: response.ok,
    status: response.status,
    data: await response.json(),
  };
}

export async function googleRegisterService(userData: any) {
  try {
    const response = await fetch("/api/googleRegister", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    return {
      ok: response.ok,
      data,
    };

  } catch (err) {
    console.error("googleSignupService error:", err);
    return { ok: false, data: { message: "Network error" } };
  }
}
