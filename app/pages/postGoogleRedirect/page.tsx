"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

export default function PostGoogleRedirect() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (!session || !session.user?.email) {
        router.push("/pages/login");
        return;
      }

      const mode = localStorage.getItem("googleAuthMode") || "login";
      const email = session.user.email;

      // Check if user exists in DB
      const checkRes = await fetch(`/api/auth/checkUser?email=${encodeURIComponent(email)}`);
      const checkData = await checkRes.json();

      if (mode === "login") {
        if (!checkData.exists) {
          alert("User does not exist. Please register first.");
          router.push("/pages/login");
          return;
        }
        router.push("/pages/getAllTaskByUser");
        return;
      }

      if (mode === "register") {
        if (checkData.exists) {
          // User already exists → redirect to tasks
          router.push("/pages/getAllTaskByUser");
          return;
        }

        // User does not exist → create new user
        const createRes = await fetch("/api/auth/googleRegister", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: session.user?.name,
            email: session.user?.email,
            image: session.user?.image,
          }),
        });

        if (!createRes.ok) {
          alert("Registration failed");
          router.push("/pages/login");
          return;
        }

        router.push("/pages/createProject");
      }
    })();
  }, [router]);

  return <p>Loading...</p>;
}
