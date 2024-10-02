import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
export default resend;

// Note: By default, you can only send emails to your Resend account email
// address until you add a domain in your Resend dashboard. Adding a domain
// also allows you to specify your own `from` address.
