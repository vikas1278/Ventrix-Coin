import 'dotenv/config';
import { google } from 'googleapis';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
  console.error('Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET first.'); process.exit(1);
}
const redirect = process.env.GMAIL_REDIRECT_URI || 'https://developers.google.com/oauthplayground';
const oauth = new google.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET, redirect);
const url = oauth.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: ['https://www.googleapis.com/auth/gmail.readonly'] });
console.log('\n1) Open this URL, sign in to the Gmail account that receives Slice payment alerts, and authorize read-only Gmail access.\n');
console.log(url + '\n');
const rl = readline.createInterface({ input, output });
const code = await rl.question('Paste the authorization code (do not share it with anyone): ');
rl.close();
const { tokens } = await oauth.getToken(code.trim());
console.log('\nSave this refresh token in your private .env file. Do not post it or commit it to Git.\n');
console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token || 'No refresh token returned; revoke access and repeat with consent prompt.'}`);
