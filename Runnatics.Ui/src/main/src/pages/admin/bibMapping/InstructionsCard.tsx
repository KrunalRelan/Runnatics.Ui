import React, { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import {
  Usb,
  Keyboard,
  MousePointer,
  Radio,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STORAGE_KEY = 'bibMapping.instructions.collapsed';

interface Step {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    n: 1,
    icon: <Usb size={20} />,
    title: 'Connect your reader',
    body:
      "Plug your Identium UHF Desktop Reader into your laptop's USB port. Your laptop will recognize it as a USB keyboard automatically. No drivers needed.",
  },
  {
    n: 2,
    icon: <Keyboard size={20} />,
    title: 'Confirm reader is in HID Keyboard mode',
    body:
      "Open any text editor (Notepad, Word) and place a chip on the reader. If the EPC hex (e.g. E2003412…) appears, you're good. If nothing happens, use the Identium utility to switch the reader to 'HID Keyboard Emulation' mode.",
  },
  {
    n: 3,
    icon: <MousePointer size={20} />,
    title: 'Select a BIB to map',
    body:
      'Click the EPC input field next to any BIB number below, OR click Start Mapping to auto-focus the first unmapped BIB.',
  },
  {
    n: 4,
    icon: <Radio size={20} />,
    title: 'Scan chips one by one',
    body:
      'Place a chip on the reader. The EPC will be entered and saved automatically. The next unmapped BIB is auto-focused. Keep placing chips to continue mapping.',
  },
  {
    n: 5,
    icon: <AlertCircle size={20} />,
    title: 'Handling duplicates',
    body:
      "If a chip is already mapped to another BIB, you'll see a warning and can choose to keep the existing mapping or override it.",
  },
];

const SHORTCUTS: { combo: string; action: string }[] = [
  { combo: 'Enter', action: 'Submit current EPC' },
  { combo: 'Esc', action: 'Jump to search box' },
  { combo: 'Tab', action: 'Move to next BIB' },
  { combo: 'Shift + Tab', action: 'Move to previous BIB' },
  { combo: 'Ctrl + Shift + S', action: 'Focus first unmapped BIB' },
];

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCollapsed(v: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
  } catch {
    // ignore quota / privacy-mode errors
  }
}

const InstructionsCard: React.FC = () => {
  const [expanded, setExpanded] = useState(() => !readCollapsed());

  const toggle = () => setExpanded((v) => !v);
  const dismiss = () => {
    writeCollapsed(true);
    setExpanded(false);
  };

  return (
    <Paper sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={600}>
          How to map BIBs to chips
        </Typography>
        <IconButton size="small" onClick={toggle} aria-label={expanded ? 'Collapse instructions' : 'Expand instructions'}>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </IconButton>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2, display: 'grid', gap: 1.5 }}>
          {STEPS.map((step) => (
            <Box
              key={step.n}
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.5 }}
            >
              <Box
                sx={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {step.icon}
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Step {step.n} — {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, lineHeight: 1.55 }}>
                  {step.body}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Keyboard shortcuts
        </Typography>
        <Box
          component="dl"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr',
            columnGap: 2,
            rowGap: 0.75,
            m: 0,
            fontSize: '0.875rem',
          }}
        >
          {SHORTCUTS.map((s) => (
            <React.Fragment key={s.combo}>
              <Box component="dt">
                <Box component="kbd" sx={kbdStyle}>{s.combo}</Box>
              </Box>
              <Box component="dd" sx={{ m: 0, color: 'text.secondary' }}>{s.action}</Box>
            </React.Fragment>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="text" onClick={dismiss}>
            Got it, hide these instructions
          </Button>
        </Box>
      </Collapse>
    </Paper>
  );
};

const kbdStyle = {
  fontFamily: 'monospace',
  fontSize: '0.8125rem',
  px: 0.75,
  py: 0.125,
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'divider',
  backgroundColor: 'action.hover',
  whiteSpace: 'nowrap' as const,
};

export default InstructionsCard;
