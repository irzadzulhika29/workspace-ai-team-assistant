import express from 'express';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import '../config/env.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// n8n webhook URLs
const N8N_WEBHOOK_BASE = process.env.N8N_WEBHOOK_BASE_URL || 
  'https://undappled-deliriously-yukiko.ngrok-free.dev';

const N8N_SEND_EMAIL_WEBHOOK = `${N8N_WEBHOOK_BASE}/webhook/send-email`;
const N8N_REVISE_DRAFT_WEBHOOK = `${N8N_WEBHOOK_BASE}/webhook-test/email`;

/**
 * List email drafts for current user
 * GET /api/email/drafts?status=draft&limit=50
 */
router.get('/drafts', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'draft', limit = 50 } = req.query;

    let query = supabase
      .from('email_drafts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.json({ drafts: data || [] });
  } catch (error) {
    console.error('Error listing drafts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get single draft by ID
 * GET /api/email/drafts/:id
 */
router.get('/drafts/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('email_drafts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    res.json({ draft: data });
  } catch (error) {
    console.error('Error getting draft:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create new email draft
 * POST /api/email/drafts
 */
router.post('/drafts', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      to_email,
      subject,
      body_text,
      body_html,
      source_message_id,
      source_thread_id,
      source_email_payload,
      cc,
      bcc,
      draft_type = 'reply',
      session_id
    } = req.body;

    const { data, error } = await supabase
      .from('email_drafts')
      .insert({
        user_id: userId,
        to_email,
        subject,
        body_text,
        body_html,
        source_message_id,
        source_thread_id,
        source_email_payload,
        cc,
        bcc,
        draft_type,
        session_id,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ draft: data });
  } catch (error) {
    console.error('Error creating draft:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update draft
 * PATCH /api/email/drafts/:id
 */
router.patch('/drafts/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('email_drafts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    res.json({ draft: data });
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete draft
 * DELETE /api/email/drafts/:id
 */
router.delete('/drafts/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('email_drafts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send draft via n8n webhook
 * POST /api/email/drafts/:id/send
 */
router.post('/drafts/:id/send', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get draft
    const { data: draft, error: fetchError } = await supabase
      .from('email_drafts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    // Prepare payload for n8n webhook
    const webhookPayload = {
      user_id: userId,
      draft_id: draft.id,
      to: draft.to_email,
      cc: draft.cc,
      bcc: draft.bcc,
      subject: draft.subject,
      body_text: draft.body_text,
      body_html: draft.body_html,
      source_message_id: draft.source_message_id,
      source_thread_id: draft.source_thread_id,
      draft_type: draft.draft_type
    };


    // Send to n8n webhook
    const webhookResponse = await axios.post(N8N_SEND_EMAIL_WEBHOOK, webhookPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds
    });


    // Extract sent message ID from webhook response
    const sentMessageId = webhookResponse.data?.message_id || 
                         webhookResponse.data?.messageId || 
                         webhookResponse.data?.id || 
                         null;

    // Update draft status to sent
    const { data: updatedDraft, error: updateError } = await supabase
      .from('email_drafts')
      .update({
        status: 'sent',
        sent_message_id: sentMessageId,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({ 
      draft: updatedDraft,
      webhook_response: webhookResponse.data
    });
  } catch (error) {
    console.error('Error sending draft:', error);
    
    // Mark draft as failed
    try {
      await supabase
        .from('email_drafts')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', req.params.id)
        .eq('user_id', req.user.id);
    } catch (updateError) {
      console.error('Error updating draft status to failed:', updateError);
    }

    res.status(500).json({ 
      error: error.response?.data?.error || error.message || 'Failed to send email'
    });
  }
});

/**
 * Revise draft with AI via n8n webhook
 * POST /api/email/drafts/:id/revise
 */
router.post('/drafts/:id/revise', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { revision_note } = req.body;

    if (!revision_note) {
      return res.status(400).json({ error: 'revision_note is required' });
    }

    // Get current draft
    const { data: draft, error: fetchError } = await supabase
      .from('email_drafts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    // Prepare payload for n8n webhook
    const webhookPayload = {
      user_id: userId,
      draft_id: draft.id,
      action: 'revise',
      revision_instructions: revision_note,
      current_draft: {
        to: draft.to_email,
        subject: draft.subject,
        body_text: draft.body_text,
        body_html: draft.body_html
      },
      source_email: draft.source_email_payload || {}
    };


    // Send to n8n webhook for AI revision
    const webhookResponse = await axios.post(N8N_REVISE_DRAFT_WEBHOOK, webhookPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds
    });


    // Extract revised content from webhook response
    const revisedBodyText = webhookResponse.data?.draftContent || 
                           webhookResponse.data?.body_text || 
                           draft.body_text;
    
    const revisedBodyHtml = webhookResponse.data?.draftContentHtml || 
                           webhookResponse.data?.body_html || 
                           draft.body_html;

    // Update draft with revised content
    const { data: updatedDraft, error: updateError } = await supabase
      .from('email_drafts')
      .update({
        body_text: revisedBodyText,
        body_html: revisedBodyHtml,
        revision_note,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({ 
      draft: updatedDraft,
      webhook_response: webhookResponse.data
    });
  } catch (error) {
    console.error('Error revising draft:', error);
    res.status(500).json({ 
      error: error.response?.data?.error || error.message || 'Failed to revise draft'
    });
  }
});

export default router;
