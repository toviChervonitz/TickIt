"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Typography, Tooltip } from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import React, { useState } from "react";
import { Lang } from "../models/types";

export default function LanguageSwitcher() {
    const { lang, setLang } = useLanguage();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeLanguage = (lng: Lang) => {
        setLang(lng);
        handleClose();
    };

    return (
        <>
            <Tooltip title={lang === "en" ? "Change Language" : "שנה שפה"}
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
                    {/* <Typography sx={{ ml: 1, fontWeight: "bold" }}>
                        {lang === "en" ? "EN" : "עב"}
                    </Typography> */}
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

                {/* future languages */}
                {/* <MenuItem onClick={() => changeLanguage("fr")}>
          <ListItemIcon>🇫🇷</ListItemIcon>
          <ListItemText primary="Français" />
        </MenuItem> */}
            </Menu>
        </>
    );
}
