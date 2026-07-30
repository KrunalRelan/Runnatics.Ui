// Admin (SuperAdmin-only) editor for the public About page:
// story copy, story image and the Founders tiles.
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import {
  AboutContentService,
  type AboutContentDto,
  type FounderDto,
  type SaveFounderRequest,
} from '../../../services/AboutContentService';

// Client-side upload cap. The server rejects ~1MB+; capping lower here keeps the
// About page payload (all images ship in one GET) reasonable.
const MAX_IMAGE_BYTES = 500 * 1024;

/** Reads a file input into a bare base64 string (no data: prefix — matches how
 *  event banners are stored) or rejects when it's too large / not an image. */
function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error('Image must be under 500KB. Please resize and retry.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      resolve(result.substring(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });
}

const toImgSrc = (base64?: string | null): string | undefined =>
  base64 ? `data:image/*;base64,${base64}` : undefined;

// ── Founder add/edit dialog ───────────────────────────────────────

interface FounderDialogProps {
  open: boolean;
  founder: FounderDto | null; // null = create
  busy: boolean;
  onClose: () => void;
  onSave: (payload: SaveFounderRequest, id?: string) => void;
}

function FounderDialog({ open, founder, busy, onClose, onSave }: FounderDialogProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(founder?.name ?? '');
      setRole(founder?.role ?? '');
      setBio(founder?.bio ?? '');
      setPhotoBase64(founder?.photoBase64 ?? null);
      setError(null);
    }
  }, [open, founder]);

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPhotoBase64(await readImageFile(file));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    }
  };

  const save = () => {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    onSave(
      {
        name: name.trim(),
        role: role.trim() || null,
        bio: bio.trim() || null,
        photoBase64,
        displayOrder: founder?.displayOrder ?? 0,
      },
      founder?.id,
    );
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{founder ? 'Edit Founder' : 'Add Founder'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={toImgSrc(photoBase64)} sx={{ width: 72, height: 72 }}>
              {name.trim() ? name.trim()[0].toUpperCase() : '?'}
            </Avatar>
            <Stack spacing={0.5}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PhotoCameraIcon />}
                onClick={() => fileRef.current?.click()}
                disabled={busy}
              >
                {photoBase64 ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {photoBase64 && (
                <Button size="small" color="error" onClick={() => setPhotoBase64(null)} disabled={busy}>
                  Remove Photo
                </Button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  void pickPhoto(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </Stack>
          </Stack>

          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            inputProps={{ maxLength: 200 }}
            disabled={busy}
          />
          <TextField
            label="Role / Designation"
            placeholder="e.g. Co-Founder"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
            inputProps={{ maxLength: 200 }}
            disabled={busy}
          />
          <TextField
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            inputProps={{ maxLength: 1000 }}
            helperText={`${bio.length}/1000`}
            disabled={busy}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={busy} startIcon={busy ? <CircularProgress size={16} /> : <SaveIcon />}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────

function AboutPageEditor() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [whoWeAre, setWhoWeAre] = useState('');
  const [mission, setMission] = useState('');
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [founders, setFounders] = useState<FounderDto[]>([]);

  const [savingCopy, setSavingCopy] = useState(false);
  const [founderBusy, setFounderBusy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFounder, setEditingFounder] = useState<FounderDto | null>(null);
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; text: string } | null>(null);
  const storyFileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data: AboutContentDto = await AboutContentService.getContent();
      setWhoWeAre(data.whoWeAre ?? '');
      setMission(data.mission ?? '');
      setStoryImage(data.storyImageBase64 ?? null);
      setFounders(data.founders ?? []);
    } catch {
      setLoadError('Failed to load the About page content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const saveCopy = async () => {
    setSavingCopy(true);
    try {
      await AboutContentService.updateContent({
        whoWeAre: whoWeAre.trim() || null,
        mission: mission.trim() || null,
        storyImageBase64: storyImage,
      });
      setToast({ severity: 'success', text: 'About page content saved.' });
    } catch {
      setToast({ severity: 'error', text: 'Failed to save. Please try again.' });
    } finally {
      setSavingCopy(false);
    }
  };

  const pickStoryImage = async (file: File | undefined) => {
    if (!file) return;
    try {
      setStoryImage(await readImageFile(file));
    } catch (e) {
      setToast({ severity: 'error', text: e instanceof Error ? e.message : 'Upload failed.' });
    }
  };

  const saveFounder = async (payload: SaveFounderRequest, id?: string) => {
    setFounderBusy(true);
    try {
      if (id) {
        const updated = await AboutContentService.updateFounder(id, payload);
        setFounders((list) => list.map((f) => (f.id === id ? updated : f)));
      } else {
        // New founders append at the end of the display order.
        const created = await AboutContentService.createFounder({
          ...payload,
          displayOrder: founders.length > 0 ? Math.max(...founders.map((f) => f.displayOrder)) + 1 : 1,
        });
        setFounders((list) => [...list, created]);
      }
      setDialogOpen(false);
      setToast({ severity: 'success', text: id ? 'Founder updated.' : 'Founder added.' });
    } catch {
      setToast({ severity: 'error', text: 'Failed to save the founder. Please try again.' });
    } finally {
      setFounderBusy(false);
    }
  };

  const deleteFounder = async (f: FounderDto) => {
    if (!window.confirm(`Remove "${f.name}" from the About page?`)) return;
    setFounderBusy(true);
    try {
      await AboutContentService.deleteFounder(f.id);
      setFounders((list) => list.filter((x) => x.id !== f.id));
      setToast({ severity: 'success', text: 'Founder removed.' });
    } catch {
      setToast({ severity: 'error', text: 'Failed to remove the founder.' });
    } finally {
      setFounderBusy(false);
    }
  };

  // Swap DisplayOrder with the neighbour and persist both rows.
  const move = async (index: number, delta: -1 | 1) => {
    const j = index + delta;
    if (j < 0 || j >= founders.length) return;
    const a = founders[index];
    const b = founders[j];
    setFounderBusy(true);
    try {
      const [ua, ub] = await Promise.all([
        AboutContentService.updateFounder(a.id, {
          name: a.name, role: a.role, bio: a.bio, photoBase64: a.photoBase64, displayOrder: b.displayOrder,
        }),
        AboutContentService.updateFounder(b.id, {
          name: b.name, role: b.role, bio: b.bio, photoBase64: b.photoBase64, displayOrder: a.displayOrder,
        }),
      ]);
      setFounders((list) => {
        const next = list.map((f) => (f.id === ua.id ? ua : f.id === ub.id ? ub : f));
        return [...next].sort((x, y) => x.displayOrder - y.displayOrder);
      });
    } catch {
      setToast({ severity: 'error', text: 'Failed to reorder. Please refresh and retry.' });
    } finally {
      setFounderBusy(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="240px">
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box p={3}>
        <Alert severity="error" action={<Button onClick={() => void load()}>Retry</Button>}>
          {loadError}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3} maxWidth={900} mx="auto">
      <Typography variant="h5" fontWeight={700} gutterBottom>
        About Page
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Content shown on the public website's About page. Changes appear on the site within a couple of minutes.
      </Typography>

      {/* Story copy + image */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Story</Typography>
          <Stack spacing={2}>
            <TextField
              label="Who We Are"
              value={whoWeAre}
              onChange={(e) => setWhoWeAre(e.target.value)}
              fullWidth
              multiline
              minRows={4}
              disabled={savingCopy}
            />
            <TextField
              label="Our Mission"
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              fullWidth
              multiline
              minRows={4}
              disabled={savingCopy}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>Story Image</Typography>
              {storyImage ? (
                <Box
                  component="img"
                  src={toImgSrc(storyImage)}
                  alt="Story"
                  sx={{ maxWidth: 320, width: '100%', borderRadius: 2, display: 'block', mb: 1 }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  No image set — the public page shows a placeholder.
                </Typography>
              )}
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PhotoCameraIcon />}
                  onClick={() => storyFileRef.current?.click()}
                  disabled={savingCopy}
                >
                  {storyImage ? 'Change Image' : 'Upload Image'}
                </Button>
                {storyImage && (
                  <Button size="small" color="error" onClick={() => setStoryImage(null)} disabled={savingCopy}>
                    Remove
                  </Button>
                )}
              </Stack>
              <input
                ref={storyFileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  void pickStoryImage(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </Box>

            <Box>
              <Button
                variant="contained"
                onClick={() => void saveCopy()}
                disabled={savingCopy}
                startIcon={savingCopy ? <CircularProgress size={16} /> : <SaveIcon />}
              >
                Save Story
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Founders */}
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Founders</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => { setEditingFounder(null); setDialogOpen(true); }}
              disabled={founderBusy}
            >
              Add Founder
            </Button>
          </Stack>

          {founders.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No founders yet. The Founders section is hidden on the public page until at least one is added.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {founders.map((f, i) => (
                <Stack
                  key={f.id}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                >
                  <Avatar src={toImgSrc(f.photoBase64)} sx={{ width: 56, height: 56 }}>
                    {f.name.trim() ? f.name.trim()[0].toUpperCase() : '?'}
                  </Avatar>
                  <Box flex={1} minWidth={0}>
                    <Typography fontWeight={600} noWrap>{f.name}</Typography>
                    {f.role && <Typography variant="body2" color="text.secondary" noWrap>{f.role}</Typography>}
                    {f.bio && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {f.bio}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Move up">
                      <span>
                        <IconButton size="small" onClick={() => void move(i, -1)} disabled={founderBusy || i === 0}>
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Move down">
                      <span>
                        <IconButton size="small" onClick={() => void move(i, 1)} disabled={founderBusy || i === founders.length - 1}>
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <span>
                        <IconButton size="small" onClick={() => { setEditingFounder(f); setDialogOpen(true); }} disabled={founderBusy}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <span>
                        <IconButton size="small" color="error" onClick={() => void deleteFounder(f)} disabled={founderBusy}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <FounderDialog
        open={dialogOpen}
        founder={editingFounder}
        busy={founderBusy}
        onClose={() => setDialogOpen(false)}
        onSave={(payload, id) => void saveFounder(payload, id)}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast?.severity ?? 'success'} onClose={() => setToast(null)}>
          {toast?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AboutPageEditor;
