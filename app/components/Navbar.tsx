"use client";
import useAppStore from "@/app/store/useAppStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const hiddenRoutes = ["/pages/login", "/pages/register", "/", "/pages/createProject"];

  if (hiddenRoutes.includes(pathname)) {
    return null;
  }
  const handleLogout = () => {
    console.log("in logout");
    logout();
    router.push("/");
  };
  const handleProfile = () => {
    router.push("/pages/profile");
  };
  return (
    <nav>
      <Link href="/pages/dashboard">Home</Link>
      <Link href="/pages/getAllProjects">Projects</Link>
      <Link href="/pages/getAllTaskByUser">Tasks</Link>
      {/* <Link href="/pages/profile">Profile</Link> */}

      {user ? (
        <>
          {/* Profile Image */}
          {user.image && (
            <img
              src={user.image}
              alt="profile_image"
              // style={styles.avatar}
            />
          )}

          {/* Username */}
          <button onClick={handleProfile}>{user.name}</button>

          {/* Logout */}
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Link href="/pages/login">Login</Link>
      )}
    </nav>
  );
}
