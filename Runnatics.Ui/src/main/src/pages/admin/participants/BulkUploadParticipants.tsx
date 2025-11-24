import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  CloudUpload,
  Download,
  Close,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { Participant } from "@/main/src/models/races/Participant";

interface BulkUploadParticipantsProps {
  open: boolean;
  onClose: () => void;
  onUpload: (participants: Participant[]) => void;
  eventId?: string;
  raceId?: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  validRecords: number;
  invalidRecords: number;
  errors: string[];
}

const BulkUploadParticipants: React.FC<BulkUploadParticipantsProps> = ({
  open,
  onClose,
  onUpload,
  eventId,
  raceId,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (
        file.type === "text/csv" ||
        file.type === "application/vnd.ms-excel" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        alert("Please select a valid CSV or Excel file");
        event.target.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const parseCSV = (text: string): Participant[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error("File must contain a header row and at least one data row");
    }

    // Parse header
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    // Validate required columns (bib and first_name are required, chipId will be auto-generated)
    const requiredColumns = ["bib", "first_name"];
    const missingColumns = requiredColumns.filter(
      (col) => !headers.includes(col)
    );
    if (missingColumns.length > 0) {
      throw new Error(
        `Missing required columns: ${missingColumns.join(", ")}`
      );
    }

    // Parse data rows
    const participants: Participant[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(",").map((v) => v.trim());
        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });

        // Validate required fields
        if (!row.bib || !row.first_name) {
          errors.push(`Row ${i + 1}: Missing required fields (bib or first_name)`);
          continue;
        }

        // Map age_category to category
        let category = "Open";
        if (row.age_category) {
          const ageCategory = row.age_category.toLowerCase();
          if (ageCategory.includes("veteran") || ageCategory.includes("senior")) {
            category = "Veteran";
          } else if (ageCategory.includes("junior") || ageCategory.includes("youth")) {
            category = "Junior";
          }
        }

        participants.push({
          bib: row.bib,
          name: row.first_name,
          chipId: row.chipid || `CHIP${row.bib}`, // Use chipId if provided, otherwise auto-generate
          gender: row.gender || "Male",
          category: category,
          status: "Registered",
          checkIn: false,
          raceId: raceId,
          eventId: eventId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Invalid data format"}`);
      }
    }

    if (errors.length > 0 && participants.length === 0) {
      throw new Error(`All rows failed validation:\n${errors.join("\n")}`);
    }

    return participants;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const text = await selectedFile.text();
      const errors: string[] = [];

      let participants: Participant[] = [];

      try {
        participants = parseCSV(text);
      } catch (error) {
        throw new Error(
          `Failed to parse file: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }

      if (participants.length === 0) {
        throw new Error("No valid participant records found in the file");
      }

      // Call the upload callback
      onUpload(participants);

      setUploadResult({
        success: true,
        message: `Successfully uploaded ${participants.length} participant(s)`,
        validRecords: participants.length,
        invalidRecords: errors.length,
        errors: errors,
      });

      // Close dialog after successful upload
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
        validRecords: 0,
        invalidRecords: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "bib,first_name,gender,age_category,email,mob\n" +
      "1001,John Doe,Male,Open,john.doe@example.com,1234567890\n" +
      "1002,Jane Smith,Female,Open,jane.smith@example.com,0987654321\n" +
      "1003,Mike Johnson,Male,Veteran,mike.johnson@example.com,1122334455";

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "participants_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    handleRemoveFile();
    setUploadResult(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={(_event, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
          return;
        }
        handleClose();
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Bulk Upload Participants
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Upload a CSV or Excel file with participant data
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Download Template Button */}
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownloadTemplate}
            fullWidth
            sx={{ mb: 3 }}
          >
            Download CSV Template
          </Button>

          {/* File Upload Area */}
          <Box
            sx={{
              border: (theme) => `2px dashed ${theme.palette.divider}`,
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              bgcolor: "action.hover",
              cursor: "pointer",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.selected",
              },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              Click to select a file or drag and drop
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported formats: CSV, Excel (.xlsx, .xls)
            </Typography>
          </Box>

          {/* Selected File Display */}
          {selectedFile && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "primary.light",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={500} color="primary.contrastText">
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "primary.contrastText", opacity: 0.8 }}>
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </Typography>
              </Box>
              <IconButton onClick={handleRemoveFile} size="small" sx={{ color: "primary.contrastText" }}>
                <Close />
              </IconButton>
            </Box>
          )}

          {/* Upload Progress */}
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, textAlign: "center" }}
              >
                Processing file...
              </Typography>
            </Box>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <Alert
              severity={uploadResult.success ? "success" : "error"}
              icon={uploadResult.success ? <CheckCircle /> : <ErrorIcon />}
              sx={{ mt: 2 }}
            >
              <Typography variant="body2" fontWeight={500}>
                {uploadResult.message}
              </Typography>
              {uploadResult.validRecords > 0 && (
                <Typography variant="caption">
                  Valid records: {uploadResult.validRecords}
                </Typography>
              )}
              {uploadResult.invalidRecords > 0 && (
                <Typography variant="caption" display="block">
                  Invalid records: {uploadResult.invalidRecords}
                </Typography>
              )}
              {uploadResult.errors.length > 0 && (
                <List dense sx={{ mt: 1 }}>
                  {uploadResult.errors.slice(0, 5).map((error, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={error}
                        primaryTypographyProps={{
                          variant: "caption",
                          color: "error",
                        }}
                      />
                    </ListItem>
                  ))}
                  {uploadResult.errors.length > 5 && (
                    <Typography variant="caption" color="error">
                      ... and {uploadResult.errors.length - 5} more errors
                    </Typography>
                  )}
                </List>
              )}
            </Alert>
          )}

          {/* Instructions */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight={500} gutterBottom>
              File Format Requirements:
            </Typography>
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="Required columns: bib, first_name"
                  primaryTypographyProps={{ variant: "caption" }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="Optional columns: gender, age_category, email, mob, chipId"
                  primaryTypographyProps={{ variant: "caption" }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="First row must contain column headers"
                  primaryTypographyProps={{ variant: "caption" }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="If chipId is not provided, it will be auto-generated as CHIP{bib}"
                  primaryTypographyProps={{ variant: "caption" }}
                />
              </ListItem>
            </List>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined" disabled={uploading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || uploading}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkUploadParticipants;
