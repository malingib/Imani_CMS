# How to Set Up Templates in EmailJS

## Step 1: Create the Invitation Template

1. Go to **EmailJS Dashboard** → **Email Templates**
2. Click **Create New Template**
3. Set the **Template Name** to: `Invitation Template` (or similar)
4. Set the **Subject** to:
   ```
   You've been invited to join {{church_name}} on IMANI CMS
   ```
5. In the **Content** tab, select **Desktop** view
6. Click **Edit Content** 
7. Paste the entire **TEMPLATE 1: INVITATION EMAIL** HTML from [emailjs-templates.html](emailjs-templates.html)
8. Save the template
9. Copy the **Template ID** (looks like `template_xxx`) and save it to your `.env` as `VITE_EMAILJS_TEMPLATE_INVITE_ID`

---

## Step 2: Create the Password Reset Template

1. Click **Create New Template** again
2. Set the **Template Name** to: `Password Reset Template` (or similar)
3. Set the **Subject** to:
   ```
   Reset your IMANI CMS password
   ```
4. In the **Content** tab, select **Desktop** view
5. Click **Edit Content**
6. Paste the entire **TEMPLATE 2: PASSWORD RESET EMAIL** HTML from [emailjs-templates.html](emailjs-templates.html)
7. Save the template
8. Copy the **Template ID** and save it to your `.env` as `VITE_EMAILJS_TEMPLATE_PASSWORD_RESET_ID`

---

## Step 3: Verify Template Variables

Before saving, make sure both templates have these placeholder variables in the HTML:

### Invitation Template Variables:
- `{{to_email}}`
- `{{token}}`
- `{{invite_link}}`
- `{{church_name}}`
- `{{role}}`

### Password Reset Template Variables:
- `{{to_email}}`
- `{{reset_link}}`

EmailJS will automatically detect these and allow you to map them during sending.

---

## Step 4: Update Your `.env`

Once you have both template IDs, update your `.env` file:

```
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=service_xxx
VITE_EMAILJS_TEMPLATE_INVITE_ID=template_invite_xxx
VITE_EMAILJS_TEMPLATE_PASSWORD_RESET_ID=template_reset_xxx
VITE_APP_URL=https://your-app.example.com
```

Restart your dev server after updating `.env`.

---

## Testing

1. Open the **Invitations Manager** in your app
2. Send an invite to a test email
3. Check the test email inbox for the styled invitation

If you don't see the email, check:
- EmailJS dashboard for error logs
- Browser console for any JavaScript errors
- That all env vars are set and the dev server restarted
