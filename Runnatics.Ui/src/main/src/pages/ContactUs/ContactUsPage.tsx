import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { SupportService } from '../../services/SupportService';

interface FormState {
  name: string;
  submitterEmail: string;
  subject: string;
  body: string;
}

interface FormErrors {
  name?: string;
  submitterEmail?: string;
  subject?: string;
  body?: string;
}

const ContactUsPage: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    name: '',
    submitterEmail: '',
    subject: '',
    body: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.submitterEmail.trim()) {
      newErrors.submitterEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submitterEmail)) {
      newErrors.submitterEmail = 'Enter a valid email address';
    }
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.body.trim()) newErrors.body = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setApiError(null);
      await SupportService.submitContactUs({
        subject: form.subject,
        body: form.body,
        submitterEmail: form.submitterEmail,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setApiError(error.response?.data?.message || error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Paper sx={{ p: 4, maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Message Sent!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thank you for reaching out. We will get back to you at{' '}
            <strong>{form.submitterEmail}</strong> as soon as possible.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => {
              setSuccess(false);
              setForm({ name: '', submitterEmail: '', subject: '', body: '' });
            }}
          >
            Send Another Message
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '60vh', pt: 6 }}>
      <Paper sx={{ p: 4, maxWidth: 560, width: '100%' }}>
        <Typography variant="h5" gutterBottom fontWeight={700}>
          Contact Us
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Have a question or need support? Fill in the form below and we will be in touch.
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            name="submitterEmail"
            type="email"
            value={form.submitterEmail}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.submitterEmail}
            helperText={errors.submitterEmail}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.subject}
            helperText={errors.subject}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Message"
            name="body"
            value={form.body}
            onChange={handleChange}
            fullWidth
            required
            multiline
            rows={5}
            error={!!errors.body}
            helperText={errors.body}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Message'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ContactUsPage;
