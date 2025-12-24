"use client";

import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Typography, Tooltip } from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import React, { useState } from "react";
import { Lang } from "../models/types";
import useAppStore from "../store/useAppStore";

export default function LanguageSwitcher() {
    const {language, setLanguage}=useAppStore()

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeLanguage = (lng: Lang) => {
        setLanguage(lng)
        handleClose();
    };

    return (
        <>
            <Tooltip title={language === "en" ? "Change Language" : "שנה שפה"}
            >
                <IconButton
                    onClick={handleOpen}
                    sx={{
                        color: "#3dd2cc",
                        border: "1px solid rgba(61,210,204,0.3)",
                        "&:hover": {
                            backgroundColor: "rgba(61,210,204,0.1)",
                        }
                    }}
                >
                    <PublicIcon sx={{ fontSize: 28 }} />
                </IconButton>
            </Tooltip>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={() => changeLanguage("en")}>
                    <ListItemIcon>🇺🇸</ListItemIcon>
                    <ListItemText primary="English" />
                </MenuItem>

                <MenuItem onClick={() => changeLanguage("he")}>
                    <ListItemIcon>🇮🇱</ListItemIcon>
                    <ListItemText primary="עברית" />
                </MenuItem>

            </Menu>
        </>
    );
}
