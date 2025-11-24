// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { getSession } from "next-auth/react";
// import useAppStore from "@/app/store/useAppStore";

// export default function PostGoogleRedirect() {
//   const router = useRouter();
//   const { setUser } = useAppStore();

//   useEffect(() => {
//     (async () => {
//       const session = await getSession();
//       if (!session || !session.user?.email) {
//         router.push("/pages/login");
//         return;
//       }

//       const mode = localStorage.getItem("googleAuthMode") || "login";
//       const email = session.user.email;

//       // Check if user exists in DB
//       const checkRes = await fetch(`/api/auth/checkUser?email=${encodeURIComponent(email)}`);
//       const checkData = await checkRes.json();

//       if (mode === "login") {
//         if (!checkData.exists) {
//           alert("User does not exist. Please register first.");
//           router.push("/pages/register");
//           return;
//         }

//         // Login with Google - get token and user info
//         const loginRes = await fetch("/api/auth/googleLogin", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//           body: JSON.stringify({ email }),
//         });

//         if (!loginRes.ok) {
//           alert("Login failed");
//           router.push("/pages/login");
//           return;
//         }

//         const loginData = await loginRes.json();

//         // Store token in localStorage
//         if (loginData.token) {
//           localStorage.setItem("token", loginData.token);
//         }

//         // Store user in Zustand
//         if (loginData.user) {
//           setUser(loginData.user);
//         }

//         router.push("/pages/getAllTaskByUser");
//         return;
//       }

//       if (mode === "register") {
//         if (checkData.exists) {
//           // User already exists → login instead
//           const loginRes = await fetch("/api/auth/googleLogin", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//             body: JSON.stringify({ email }),
//           });

//           if (loginRes.ok) {
//             const loginData = await loginRes.json();

//             if (loginData.token) {
//               localStorage.setItem("token", loginData.token);
//             }

//             if (loginData.user) {
//               setUser(loginData.user);
//             }
//           }

//           router.push("/pages/getAllTaskByUser");
//           return;
//         }

//         // User does not exist → create new user
//         const createRes = await fetch("/api/auth/googleRegister", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             name: session.user?.name,
//             email: session.user?.email,
//             image: session.user?.image,
//           }),
//         });

//         if (!createRes.ok) {
//           alert("Registration failed");
//           router.push("/pages/login");
//           return;
//         }

//         const createData = await createRes.json();

//         // Store token in localStorage
//         if (createData.token) {
//           localStorage.setItem("token", createData.token);
//         }

//         // Store user in Zustand
//         if (createData.user) {
//           setUser(createData.user);
//         }

//         router.push("/pages/createProject");
//       }
//     })();
//   }, [router, setUser]);

//   return <p>Loading...</p>;
// }
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import useAppStore from "@/app/store/useAppStore";

export default function PostGoogleRedirect() {
  const router = useRouter();
  const { setUser } = useAppStore();

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (!session || !session.user?.email) {
        router.push("/pages/login");
        return;
      }

      const mode = localStorage.getItem("googleAuthMode") || "login";
      const email = session.user.email;

      // 1. לבדוק אם המשתמש קיים ב-DB
      const checkRes = await fetch(
        `/api/auth/checkUser?email=${encodeURIComponent(email)}`
      );
      const checkData = await checkRes.json();

      // 🔵 מצב LOGIN
      if (mode === "login") {
        if (!checkData.exists) {
          alert("User does not exist. Please register first.");
          router.push("/pages/register");
          return;
        }

        // 2. התחברות דרך ה-API שלך
        const loginRes = await fetch("/api/auth/googleLogin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // חשוב לקוקי
          body: JSON.stringify({ email }),
        });

        if (!loginRes.ok) {
          alert("Login failed");
          router.push("/pages/login");
          return;
        }

        const loginData = await loginRes.json();

        // שמירת הטוקן גם בלוקל סטורג (לא חובה, אבל נוח)
        if (loginData.token) {
          localStorage.setItem("token", loginData.token);
        }

        if (loginData.user) {
          setUser(loginData.user);
        }

        router.push("/pages/dashboard");
        return;
      }

      // 🟣 מצב REGISTER
      if (mode === "register") {
        if (checkData.exists) {
          // כבר קיים → עושים פשוט login
          const loginRes = await fetch("/api/auth/googleLogin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email }),
          });

          if (loginRes.ok) {
            const loginData = await loginRes.json();

            if (loginData.token) {
              localStorage.setItem("token", loginData.token);
            }

            if (loginData.user) {
              setUser(loginData.user);
            }
          }

          router.push("/pages/dashboard");
          return;
        }

        // המשתמש לא קיים → ליצור חדש
        const createRes = await fetch("/api/auth/googleRegister", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 🔴 להוסיף גם כאן!
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

        const createData = await createRes.json();

        if (createData.token) {
          localStorage.setItem("token", createData.token);
        }

        if (createData.user) {
          setUser(createData.user);
        }

        router.push("/pages/createProject");
      }
    })();
  }, [router, setUser]);

  return <p>Loading...</p>;
}
