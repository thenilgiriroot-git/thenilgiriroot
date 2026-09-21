import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { Webhook } from 'npm:standardwebhooks@1.0.0'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature',
}

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirm your email',
  invite: "You've been invited",
  magiclink: 'Your login link',
  recovery: 'Reset your password',
  email_change: 'Confirm your new email',
  reauthentication: 'Your verification code',
}

const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

const SITE_NAME = 'The Nilgiri Root'
const SITE_URL = 'https://www.thenilgiriroot.com'
const FROM_DOMAIN = 'thenilgiriroot.com'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

// Supabase Auth "Send Email" hook (Authentication > Hooks). Verifies the
// Standard Webhooks signature, renders the branded template and enqueues it
// for process-email-queue, which delivers through Resend.
async function handleWebhook(req: Request): Promise<Response> {
  const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
  if (!hookSecret) {
    console.error('SEND_EMAIL_HOOK_SECRET not configured')
    return json({ error: 'Server configuration error' }, 500)
  }

  const rawBody = await req.text()
  let payload: any
  try {
    const wh = new Webhook(hookSecret.replace(/^v1,whsec_/, ''))
    payload = wh.verify(rawBody, Object.fromEntries(req.headers))
  } catch (error) {
    console.error('Invalid webhook signature', { error: error instanceof Error ? error.message : error })
    return json({ error: 'Invalid signature' }, 401)
  }

  const emailType: string = payload?.email_data?.email_action_type
  const recipient: string = payload?.user?.email
  const EmailTemplate = EMAIL_TEMPLATES[emailType]
  if (!EmailTemplate || !recipient) {
    console.error('Unknown email type or missing recipient', { emailType })
    return json({ error: `Unknown email type: ${emailType}` }, 400)
  }

  const d = payload.email_data
  const verifyUrl = (tokenHash: string) =>
    `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${encodeURIComponent(tokenHash)}` +
    `&type=${encodeURIComponent(emailType)}&redirect_to=${encodeURIComponent(d.redirect_to || SITE_URL)}`

  const templateProps = {
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    recipient,
    confirmationUrl: d.token_hash ? verifyUrl(d.token_hash) : SITE_URL,
    token: d.token,
    email: recipient,
    newEmail: payload.user?.new_email,
  }

  const html = await renderAsync(React.createElement(EmailTemplate, templateProps))
  const text = await renderAsync(React.createElement(EmailTemplate, templateProps), { plainText: true })

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const messageId = crypto.randomUUID()

  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: emailType,
    recipient_email: recipient,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'auth_emails',
    payload: {
      message_id: messageId,
      to: recipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      subject: EMAIL_SUBJECTS[emailType] || 'Notification',
      html,
      text,
      purpose: 'transactional',
      label: emailType,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('Failed to enqueue auth email', { error: enqueueError, emailType })
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: emailType,
      recipient_email: recipient,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })
    return json({ error: 'Failed to enqueue email' }, 500)
  }

  return json({})
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  try {
    return await handleWebhook(req)
  } catch (error) {
    console.error('Webhook handler error:', error)
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500)
  }
})
