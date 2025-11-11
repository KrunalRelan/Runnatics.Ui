import { IconButton, Tooltip } from "@mui/material";
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";
import { useTheme } from "./ThemeProvider";

function ThemeSwitcher() {
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip
      title={mode === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "rotate(180deg)",
          },
        }}
      >
        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeSwitcher;
