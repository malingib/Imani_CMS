import { init, send } from '@emailjs/browser';

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_INVITE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_INVITE_ID as string;
const TEMPLATE_PASSWORD_RESET_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_PASSWORD_RESET_ID as string;

if (PUBLIC_KEY) init(PUBLIC_KEY);

type InviteParams = {
  to_email: string;
  token: string;
  church_name?: string;
  role?: string;
  invite_link?: string;
};

type PasswordResetParams = {
  to_email: string;
  reset_link: string;
};

export async function sendInviteEmail(params: InviteParams) {
  if (!SERVICE_ID || !TEMPLATE_INVITE_ID) {
    console.warn('EmailJS not configured (invite)');
    return;
  }
  const templateParams = {
    to_email: params.to_email,
    token: params.token,
    church_name: params.church_name || '',
    role: params.role || '',
    invite_link: params.invite_link || '',
  };
  try {
    await send(SERVICE_ID, TEMPLATE_INVITE_ID, templateParams, PUBLIC_KEY);
  } catch (err) {
    console.error('sendInviteEmail error', err);
    throw err;
  }
}

export async function sendPasswordResetEmail(params: PasswordResetParams) {
  if (!SERVICE_ID || !TEMPLATE_PASSWORD_RESET_ID) {
    console.warn('EmailJS not configured (password reset)');
    return;
  }
  const templateParams = {
    to_email: params.to_email,
    reset_link: params.reset_link,
  };
  try {
    await send(SERVICE_ID, TEMPLATE_PASSWORD_RESET_ID, templateParams, PUBLIC_KEY);
  } catch (err) {
    console.error('sendPasswordResetEmail error', err);
    throw err;
  }
}
