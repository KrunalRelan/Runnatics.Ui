import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
  Tooltip,
  Paper,
  Popper,
  ClickAwayListener,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  // People as PeopleIcon,
  // BarChart as BarChartIcon,
  Settings as SettingsIcon,
  // Label as LabelIcon,
  Event as EventIcon,
  Upload as UploadIcon,
  Add as AddIcon,
  ExpandLess,
  ExpandMore,
  // Star as StarIcon,
  // Send as SendIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon,
  KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon,
} from "@mui/icons-material";
import {
  DashboardLayoutProps,
  MenuItem as MenuItemType,
} from "../models/components";
import ThemeSwitcher from "../theme/ThemeSwitcher";

const drawerWidth = 240;
const miniDrawerWidth = 64;

function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [openSubmenu, setOpenSubmenu] = useState<Record<string, boolean>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<null | HTMLElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentDrawerWidth = isMinimized ? miniDrawerWidth : drawerWidth;

  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleMinimizeToggle = (): void => {
    setIsMinimized(!isMinimized);
    // Close all submenus when minimizing
    if (!isMinimized) {
      setOpenSubmenu({});
    }
  };

  const handleSubmenuClick = (item: string): void => {
    // Don't allow submenu expansion when minimized
    if (isMinimized) return;
    
    setOpenSubmenu((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };
  
  const handleMouseEnter = (item: string, event: React.MouseEvent<HTMLElement>): void => {
    if (isMinimized) {
      // Clear any pending close timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setHoveredItem(item);
      setSubmenuAnchorEl(event.currentTarget);
    }
  };

  const handleMouseLeave = (): void => {
    if (isMinimized) {
      // Add a delay before closing to allow mouse movement to the popup
      closeTimeoutRef.current = setTimeout(() => {
        setHoveredItem(null);
        setSubmenuAnchorEl(null);
      }, 200); // 200ms delay
    }
  };
  
  const handlePopperMouseEnter = (): void => {
    // Clear the close timeout when mouse enters the popper
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handlePopperMouseLeave = (): void => {
    // Close immediately when leaving the popper
    setHoveredItem(null);
    setSubmenuAnchorEl(null);
  };

  const handleProfileMenuOpen = (
    event: React.MouseEvent<HTMLElement>
  ): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Navigate to login even if logout API fails
      navigate("/login");
    }
  };

  // Navigation menu items
  const menuItems: MenuItemType[] = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
    },
 
   
    {
      text: "Events",
      icon: <EventIcon />, // ← Import from @mui/icons-material
      path: "/events",
      submenu: [
        {
          text: "Events Dashboard",
          icon: <DashboardIcon />,
          path: "/events/events-dashboard",
        },
        {
          text: "Create Event",
          icon: <AddIcon />,
          path: "/events/events-create",
        },
        // {
        //   text: "View Event",
        //   icon: <InboxIcon />,
        //   path: "/events/event-details/:eventId",
        // },
      ],
    },
    
    {
      text: "Uploads",
      icon: <UploadIcon />,
      path: "/uploads",
      submenu: [
        { text: "RFID File Upload", icon: <UploadIcon />, path: "/rfid/upload" },
      ],
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
        {!isMinimized ? (
          <Typography variant="h6" noWrap component="div" fontWeight={700}>
            🚀 Runnatics
          </Typography>
        ) : (
          <Typography variant="h6" component="div" fontWeight={700}>
            🚀
          </Typography>
        )}
      </Toolbar>
      <Divider />
      
      {/* Minimize Toggle Button */}
      <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
        <IconButton 
          onClick={handleMinimizeToggle} 
          size="small"
          sx={{
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'white',
            },
            transition: 'all 0.3s',
          }}
        >
          {isMinimized ? <KeyboardDoubleArrowRightIcon /> : <KeyboardDoubleArrowLeftIcon />}
        </IconButton>
      </Box>
      <Divider />

      {/* Navigation Menu */}
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <Box key={item.text}>
            <Tooltip
              title={isMinimized ? item.text : ""}
              placement="right"
              arrow
            >
              <ListItem 
                disablePadding 
                sx={{ mb: 0.5 }}
                onMouseEnter={(e) => item.submenu && handleMouseEnter(item.text, e)}
                onMouseLeave={handleMouseLeave}
              >
                <ListItemButton
                  onClick={() => {
                    if (item.submenu && !isMinimized) {
                      handleSubmenuClick(item.text);
                    } else if (!item.submenu) {
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
                    justifyContent: isMinimized ? "center" : "initial",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? "white" : "primary.main",
                      minWidth: isMinimized ? "auto" : 40,
                      mr: isMinimized ? 0 : 2,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isMinimized && (
                    <>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive(item.path) ? 600 : 400,
                        }}
                      />
                      {item.submenu &&
                        (openSubmenu[item.text] ? <ExpandLess /> : <ExpandMore />)}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>

            {/* Submenu items - Expanded sidebar */}
            {item.submenu && !isMinimized && (
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
            
            {/* Submenu items - Minimized sidebar (hover popup) */}
            {item.submenu && isMinimized && hoveredItem === item.text && (
              <Popper
                open={hoveredItem === item.text}
                anchorEl={submenuAnchorEl}
                placement="right-start"
                modifiers={[
                  {
                    name: 'offset',
                    options: {
                      offset: [0, -8],
                    },
                  },
                ]}
                sx={{ zIndex: 1300 }}
              >
                <ClickAwayListener onClickAway={handlePopperMouseLeave}>
                  <Paper
                    elevation={8}
                    sx={{
                      ml: 1,
                      minWidth: 200,
                      backgroundColor: "background.paper",
                    }}
                    onMouseEnter={handlePopperMouseEnter}
                    onMouseLeave={handlePopperMouseLeave}
                  >
                    <Box sx={{ p: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ px: 2, py: 1, fontWeight: 600, color: "primary.main" }}
                      >
                        {item.text}
                      </Typography>
                      <Divider />
                      <List dense>
                        {item.submenu.map((subItem) => (
                          <ListItemButton
                            key={subItem.text}
                            sx={{
                              borderRadius: 1,
                              backgroundColor: isActive(subItem.path)
                                ? "action.selected"
                                : "transparent",
                              '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'white',
                              },
                            }}
                            onClick={() => {
                              navigate(subItem.path);
                              setMobileOpen(false);
                              handlePopperMouseLeave();
                            }}
                          >
                            <ListItemIcon sx={{ color: "text.secondary", minWidth: 36 }}>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={subItem.text}
                              primaryTypographyProps={{
                                fontSize: "0.875rem",
                                fontWeight: isActive(subItem.path) ? 600 : 400,
                              }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Box>
                  </Paper>
                </ClickAwayListener>
              </Popper>
            )}
          </Box>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Bottom menu items */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            sx={{ 
              mx: 1, 
              borderRadius: 2,
              justifyContent: isMinimized ? "center" : "initial",
            }}
            onClick={() => {
              console.log("Logout");
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: "error.main", 
                minWidth: isMinimized ? "auto" : 40,
                mr: isMinimized ? 0 : 2,
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {!isMinimized && <ListItemText primary="Logout" />}
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
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { sm: `${currentDrawerWidth}px` },
          backgroundColor: "background.paper",
          color: "text.primary",
          boxShadow: 1,
          borderBottom: 1,
          borderColor: "divider",
          transition: "width 0.3s, margin 0.3s",
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
            <MenuItem onClick={() => navigate("/profile")}>
              <ListItemIcon>
                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                  {user?.firstName?.[0] || user?.email?.[0] || "U"}
                </Avatar>
              </ListItemIcon>
              <ListItemText 
                primary="Profile" 
                secondary={user?.email || "View profile"}
              />
            </MenuItem>
            <MenuItem onClick={() => navigate("/settings")}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: currentDrawerWidth }, flexShrink: { sm: 0 } }}
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
              width: currentDrawerWidth,
              transition: "width 0.3s",
              overflowX: "hidden",
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
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          minHeight: "100vh",
          transition: "width 0.3s",
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
}

export default DashboardLayout;
