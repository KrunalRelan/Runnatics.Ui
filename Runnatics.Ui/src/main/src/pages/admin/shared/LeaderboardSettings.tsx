import React from "react";
import {
  Box,
  TextField,
  Typography,
  Stack,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
} from "@mui/material";
import { LeaderBoardSettings } from "@/main/src/models";

interface LeaderboardSettingsProps {
  settings: LeaderBoardSettings;
  onSettingsChange: (settings: LeaderBoardSettings) => void;
  showOverrideToggle?: boolean;
  overrideEnabled?: boolean;
  onOverrideToggle?: (enabled: boolean) => void;
  disabled?: boolean;
  title?: string;
  showBorder?: boolean; // New prop for explicit border control
}

export const LeaderboardSettingsComponent: React.FC<LeaderboardSettingsProps> = ({
  settings,
  onSettingsChange,
  showOverrideToggle = false,
  overrideEnabled = true,
  onOverrideToggle,
  disabled = false,
  title = "Leaderboard Settings",
  showBorder, // Will auto-determine if not provided
}) => {
  const isDisabled = disabled || (showOverrideToggle && !overrideEnabled);
  
  // Auto-determine border: show border only when override toggle is present
  // But allow explicit override via showBorder prop
  const shouldShowBorder = showBorder !== undefined 
    ? showBorder 
    : showOverrideToggle;

  const handleSettingChange = (updates: Partial<LeaderBoardSettings>) => {
    onSettingsChange({
      ...settings,
      ...updates,
    });
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header with optional toggle */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">{title}</Typography>
        {showOverrideToggle && onOverrideToggle && (
          <FormControlLabel
            control={
              <Switch
                checked={overrideEnabled}
                onChange={(e) => onOverrideToggle(e.target.checked)}
                color="primary"
              />
            }
            label="Override Event Settings"
          />
        )}
      </Stack>

      {/* Info Alert when override is disabled */}
      {showOverrideToggle && !overrideEnabled && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Using event-level leaderboard settings. Enable override to customize for this race.
        </Alert>
      )}

      <Stack spacing={3}>
        <Box
          sx={{
            p: 3,
            // Conditionally apply border based on shouldShowBorder
            ...(shouldShowBorder && {
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }),
            // Only apply disabled background when actually disabled
            bgcolor: isDisabled ? "action.disabledBackground" : "background.paper",
            opacity: isDisabled ? 0.6 : 1,
            pointerEvents: isDisabled ? "none" : "auto",
          }}
        >
          {/* Two Column Layout */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", md: "block" } }}
              />
            }
          >
            {/* Overall Results Column */}
            <Stack spacing={1.5} sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, pl: "16px", mb: 0.5 }}
              >
                Overall Results
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.ShowOverallResults}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      if (
                        isChecked &&
                        !settings.SortByOverallChipTime &&
                        !settings.SortByOverallGunTime
                      ) {
                        handleSettingChange({
                          ShowOverallResults: true,
                          SortByOverallChipTime: true,
                          SortByOverallGunTime: false,
                        });
                      } else {
                        handleSettingChange({
                          ShowOverallResults: isChecked,
                        });
                      }
                    }}
                  />
                }
                label="Show Overall Results"
              />

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  pl: "16px",
                  mb: 0.5,
                  opacity: settings.ShowOverallResults ? 1 : 0.5,
                }}
              >
                Overall Result Sort By
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.SortByOverallChipTime}
                    disabled={!settings.ShowOverallResults}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleSettingChange({
                          SortByOverallChipTime: true,
                          SortByOverallGunTime: false,
                        });
                      }
                    }}
                  />
                }
                label="Chip Time"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.SortByOverallGunTime}
                    disabled={!settings.ShowOverallResults}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleSettingChange({
                          SortByOverallGunTime: true,
                          SortByOverallChipTime: false,
                        });
                      }
                    }}
                  />
                }
                label="Gun Time"
              />
            </Stack>

            {/* Category Results Column */}
            <Stack spacing={1.5} sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, pl: "16px", mb: 0.5 }}
              >
                Category Results
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.ShowCategoryResults}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      if (
                        isChecked &&
                        !settings.SortByCategoryChipTime &&
                        !settings.SortByCategoryGunTime
                      ) {
                        handleSettingChange({
                          ShowCategoryResults: true,
                          SortByCategoryChipTime: true,
                          SortByCategoryGunTime: false,
                        });
                      } else {
                        handleSettingChange({
                          ShowCategoryResults: isChecked,
                        });
                      }
                    }}
                  />
                }
                label="Show Category Results"
              />

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  pl: "16px",
                  mb: 0.5,
                  opacity: settings.ShowCategoryResults ? 1 : 0.5,
                }}
              >
                Category Result Sort By
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.SortByCategoryChipTime}
                    disabled={!settings.ShowCategoryResults}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleSettingChange({
                          SortByCategoryChipTime: true,
                          SortByCategoryGunTime: false,
                        });
                      }
                    }}
                  />
                }
                label="Chip Time"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.SortByCategoryGunTime}
                    disabled={!settings.ShowCategoryResults}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleSettingChange({
                          SortByCategoryGunTime: true,
                          SortByCategoryChipTime: false,
                        });
                      }
                    }}
                  />
                }
                label="Gun Time"
              />
            </Stack>
          </Stack>

          {/* Number of Results Fields */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            sx={{ mt: 3 }}
          >
            {settings.ShowOverallResults && (
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Overall Results to Show"
                  type="number"
                  value={settings.NumberOfResultsToShowOverall || 10}
                  onChange={(e) =>
                    handleSettingChange({
                      NumberOfResultsToShowOverall:
                        parseInt(e.target.value, 10) || 10,
                    })
                  }
                  placeholder="Enter number of overall results"
                  size="small"
                  inputProps={{ min: 1, step: 1 }}
                  helperText="Number of overall results to display"
                />
              </Box>
            )}

            {settings.ShowCategoryResults && (
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Category Results to Show"
                  type="number"
                  value={settings.NumberOfResultsToShowCategory || 5}
                  onChange={(e) =>
                    handleSettingChange({
                      NumberOfResultsToShowCategory:
                        parseInt(e.target.value, 10) || 5,
                    })
                  }
                  placeholder="Enter number of category results"
                  size="small"
                  inputProps={{ min: 1, step: 1 }}
                  helperText="Number of category results to display"
                />
              </Box>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};