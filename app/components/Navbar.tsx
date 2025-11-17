"use client";

import useAppStore from "@/app/store/useAppStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, Divider, IconButton, Stack,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

const DRAWER_WIDTH = 260;

export default function Navbar() {
  const { user, logout } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hiddenRoutes = ["/pages/login", "/pages/register", "/"];

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
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: "Dashboard", icon: <HomeIcon />, path: "/pages/dashboard" },
    { text: "Projects", icon: <FolderIcon />, path: "/pages/getAllProjects" },
    { text: "Tasks", icon: <AssignmentIcon />, path: "/pages/getAllTaskByUser" },
  ];

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 1.5,
                  py: 1.2,
                  px: 2,
                  mb: 0.5,
                  backgroundColor: isActive
                    ? "rgba(61,210,204,0.12)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: isActive
                      ? "rgba(61,210,204,0.18)"
                      : "rgba(0,0,0,0.04)",
                  },
                  transition: "background-color 0.2s ease",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#3dd2cc" : "#1d486a",
                    minWidth: 36,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#1d486a" : "#1d486a",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "#e8eaed" }} />

      {user && (
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.04)",
              },
              transition: "background-color 0.2s ease",
            }}
            onClick={handleProfile}
          >
            <Avatar
              src={user.image}
              alt={user.name}
              sx={{
                width: 36,
                height: 36,
                backgroundColor: "#3dd2cc",
                fontSize: "0.95rem",
                fontWeight: 600,
              }}
            >
              {!user.image && user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                color="text.secondary"
                noWrap
              >
                {user.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                noWrap
              >
                View profile
              </Typography>
            </Box>
          </Stack>

          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1.5,
              py: 1.2,
              px: 2,
              mt: 1,
              "&:hover": {
                backgroundColor: "rgba(244,67,54,0.08)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "#d93025", minWidth: 36 }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: "0.95rem",
                fontWeight: 500,
                color: "#d93025",
              }}
            />
          </ListItemButton>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1300,
          display: { xs: "flex", md: "none" },
          backgroundColor: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            backgroundColor: "background.default",
            boxSizing: "border-box",
            borderRight: "1px solid #e8eaed",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            backgroundColor: "background.default",
            border: "none",
            borderRight: "1px solid #e8eaed",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      <Box
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
        }}
      />
    </>
  );
}