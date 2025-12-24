
"use client";

import { useState, useEffect } from "react";
import useAppStore from "@/app/store/useAppStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { logoutService } from "../lib/server/authServer";
import { getTranslation } from "../lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import { ROUTES } from "../config/routes";

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 60;

const hiddenRoutes = [
  "/pages/login",
  "/pages/register",
  "/",
  "/pages/createProject",
  "/pages/forgotPassword",
];

export default function Navbar() {
  const { user, logout, language } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const t = getTranslation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const hydrated = useAppStore.persist?.hasHydrated?.();

  if (!hydrated || !pathname) return null;
  if (hiddenRoutes.includes(pathname)) return null;
  if (!user) return null;

  const handleLogout = async() => {
    try{
      await logoutService();
      logout();

      router.push(ROUTES.LANDING);
      router.refresh()
    }
    catch(err){
      console.error("Logout error",err);
      
    }
  };

  const handleProfile = () => {
    router.push(ROUTES.PROFILE);
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleCollapseToggle = () => setCollapsed(!collapsed);

  const menuItems = [
    { text: t("dashboard"), icon: <HomeIcon />, path: "/pages/dashboard" },
    { text: t("projects"), icon: <FolderIcon />, path: "/pages/getAllProjects" },
    { text: t("tasks"), icon: <AssignmentIcon />, path: "/pages/getAllTaskByUser" },
    { text: t("calendar"), icon: <CalendarTodayIcon />, path: "/pages/calendar" },
    { text: t("charts"), icon: <InsertChartIcon />, path: "/pages/charts" },
  ];


  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        transition: "width 0.3s",
        backgroundColor: "background.default",
      }}
    >
    
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          p: 2,
          borderBottom: "1px solid #e8eaed",
        }}
      >
       
        {!collapsed && (
          <Box
            component="img"
            src="/logo.png"
            alt="TickIt Logo"
            sx={{ height: 45, width: "auto" }}
          />
        )}

       
        <IconButton
          size="small"
          onClick={handleCollapseToggle}
          sx={{
            backgroundColor: "rgba(0,0,0,0.04)",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.08)" },
          }}
        >
          {collapsed
            ? language === "he"
              ? <ChevronLeftIcon />
              : <ChevronRightIcon />
            : language === "he"
              ? <ChevronRightIcon />
              : <ChevronLeftIcon />}
        </IconButton>
      </Box>




     
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.text === t("projects") && pathname === "/pages/projectTask");

          return (
            <ListItem
              key={item.text}
              disablePadding
              sx={{ justifyContent: collapsed ? "center" : "flex-start" }}
            >
              <Tooltip title={collapsed ? item.text : ""} placement="right">
                <ListItemButton
                  component={Link}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    borderRadius: 1.5,
                    py: 1.2,
                    px: collapsed ? 0 : 2,
                    mb: 0.5,
                    justifyContent: collapsed ? "center" : "flex-start",
                    backgroundColor: isActive ? "rgba(61,210,204,0.12)" : "transparent",
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
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {!collapsed && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: "0.95rem",
                        fontWeight: isActive ? 600 : 500,
                        color: "#1d486a",
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "#e8eaed" }} />

     
      {user && (
        < Box sx={{ p: collapsed ? 0 : 2 }}>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            justifyContent={collapsed ? "center" : "space-between"}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                p: collapsed ? 0 : 1.5,
                borderRadius: 1.5,
                cursor: collapsed ? "default" : "pointer",
                "&:hover": !collapsed ? { backgroundColor: "rgba(0,0,0,0.04)" } : {},
              }}
              onClick={!collapsed ? handleProfile : undefined}
            >
              <Tooltip title={collapsed ? user.name : ""} placement="right">
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
              </Tooltip>

              {!collapsed && (
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary" noWrap>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
                    {t("viewProfile")}
                  </Typography>
                </Box>
              )}
            </Stack>

            {!collapsed && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={(e) => e.stopPropagation()} 
              >
                <LanguageSwitcher />
              </Box>
            )}
          </Stack>

          <Tooltip title={collapsed ? t("logout") : ""} placement="right">
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 1.5,
                py: 1.2,
                px: collapsed ? 0 : 2,
                mt: 1,
                justifyContent: collapsed ? "center" : "flex-start",
                "&:hover": { backgroundColor: "rgba(244,67,54,0.08)" },
              }}
            >
              <ListItemIcon sx={{ color: "#d93025", minWidth: 36, justifyContent: "center" }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>

              {!collapsed && (
                <ListItemText
                  primary={t("logout")}
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color: "#d93025",
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </Box>
      )
      }
    </Box >
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
          "&:hover": { backgroundColor: "#f5f5f5" },
        }}
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            backgroundColor: "background.default",
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
            boxSizing: "border-box",
            backgroundColor: "background.default",
            border: "none",
            overflowX: "hidden",
            transition: "width 0.3s",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
