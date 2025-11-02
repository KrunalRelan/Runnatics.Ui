import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Collapse,
  Badge,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Inbox as InboxIcon,
  Event as EventIcon,
  Add as AddIcon,
  ExpandLess,
  ExpandMore,
  Star as StarIcon,
  Send as SendIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import {
  DashboardLayoutProps,
  MenuItem as MenuItemType,
} from "../models/components";
import ThemeSwitcher from "../theme/ThemeSwitcher";

const drawerWidth = 240;

function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [openSubmenu, setOpenSubmenu] = useState<Record<string, boolean>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen);
  };

  const handleSubmenuClick = (item: string): void => {
    setOpenSubmenu((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleProfileMenuOpen = (
    event: React.MouseEvent<HTMLElement>
  ): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = (): void => {
    setAnchorEl(null);
  };

  // Navigation menu items
  const menuItems: MenuItemType[] = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/events/events-dashboard", // ← Your default events page
    },
    {
      text: "Events",
      icon: <EventIcon />, // ← Import from @mui/icons-material
      path: "/events",
      submenu: [
        // {
        //   text: "Events Dashboard",
        //   icon: <DashboardIcon />,
        //   path: "/events/events-dashboard",
        // },
        {
          text: "Create Event",
          icon: <AddIcon />,
          path: "/events/events-create",
        },
        {
          text: "View Event",
          icon: <InboxIcon />,
          path: "/events/events-detail/:eventId",
        },
      ],
    },
    {
      text: "Products",
      icon: <ShoppingCartIcon />,
      path: "/products",
      submenu: [
        { text: "All Products", icon: <InboxIcon />, path: "/products/all" },
        { text: "Add Product", icon: <StarIcon />, path: "/products/add" },
      ],
    },
    {
      text: "Users",
      icon: <PeopleIcon />,
      path: "/users",
    },
    {
      text: "Analytics",
      icon: <BarChartIcon />,
      path: "/analytics",
      submenu: [
        { text: "Reports", icon: <SendIcon />, path: "/analytics/reports" },
        { text: "Statistics", icon: <StarIcon />, path: "/analytics/stats" },
      ],
    },
    {
      text: "Settings",
      icon: <SettingsIcon />,
      path: "/settings",
    },
  ];

  // Check if current path matches menu item
  const isActive = (path: string): boolean => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // Drawer content (sidebar)
  const drawer = (
    <div>
      {/* Logo/Brand Section */}
      <Toolbar
        sx={{
          backgroundColor: "primary.main",
          color: "white",
          justifyContent: "center",
          minHeight: "64px !important",
        }}
      >
        <Typography variant="h6" noWrap component="div" fontWeight={700}>
          🚀 My Dashboard
        </Typography>
      </Toolbar>
      <Divider />

      {/* Navigation Menu */}
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <Box key={item.text}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  if (item.submenu) {
                    handleSubmenuClick(item.text);
                  } else {
                    navigate(item.path);
                    setMobileOpen(false);
                  }
                }}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  backgroundColor: isActive(item.path)
                    ? "primary.light"
                    : "transparent",
                  color: isActive(item.path) ? "white" : "text.primary",
                  "&:hover": {
                    backgroundColor: isActive(item.path)
                      ? "primary.main"
                      : "action.hover",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? "white" : "primary.main",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
                {item.submenu &&
                  (openSubmenu[item.text] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>

            {/* Submenu items */}
            {item.submenu && (
              <Collapse
                in={openSubmenu[item.text]}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.submenu.map((subItem) => (
                    <ListItemButton
                      key={subItem.text}
                      sx={{
                        pl: 4,
                        mx: 1,
                        borderRadius: 2,
                        backgroundColor: isActive(subItem.path)
                          ? "action.selected"
                          : "transparent",
                      }}
                      onClick={() => {
                        navigate(subItem.path);
                        setMobileOpen(false);
                      }}
                    >
                      <ListItemIcon
                        sx={{ color: "text.secondary", minWidth: 40 }}
                      >
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={subItem.text}
                        primaryTypographyProps={{
                          fontSize: "0.9rem",
                          fontWeight: isActive(subItem.path) ? 600 : 400,
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Bottom menu items */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            sx={{ mx: 1, borderRadius: 2 }}
            onClick={() => {
              console.log("Logout");
            }}
          >
            <ListItemIcon sx={{ color: "error.main", minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "background.paper",
          color: "text.primary",
          boxShadow: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar>
          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find((item) => isActive(item.path))?.text ?? "Dashboard"}
          </Typography>

          {/* Right side icons */}
          <ThemeSwitcher />

          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
              JD
            </Avatar>
          </IconButton>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
          >
            <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
            <MenuItem onClick={() => navigate("/settings")}>Settings</MenuItem>
            <Divider />
            <MenuItem onClick={() => console.log("Logout")}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
}

export default DashboardLayout;
