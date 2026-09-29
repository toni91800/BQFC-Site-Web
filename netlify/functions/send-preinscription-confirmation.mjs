const CLUB_EMAIL = '581835@lpiff.fr';
const EMAIL_TEMPLATE = 'preinscription-confirmation';
const EMAIL_SUBJECT = 'Votre demande de préinscription a bien été reçue';

function jsonResponse(status, payload){
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export default async function handler(request){
  if(request.method !== 'POST'){
    return jsonResponse(405, { error: 'Méthode non autorisée.' });
  }

  const origin = request.headers.get('origin');
  if(!origin || origin !== new URL(request.url).origin){
    return jsonResponse(403, { error: 'Origine de la requête non autorisée.' });
  }

  let submission;
  try {
    submission = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Requête invalide.' });
  }

  if(!submission || typeof submission !== 'object' || Array.isArray(submission)){
    return jsonResponse(400, { error: 'Requête invalide.' });
  }

  const email = typeof submission.email === 'string' ? submission.email.trim() : '';
  const prenom = typeof submission.prenom === 'string' ? submission.prenom.trim() : '';
  const botField = typeof submission.botField === 'string' ? submission.botField.trim() : null;
  if(!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !prenom || prenom.length > 100 || botField !== ''){
    return jsonResponse(400, { error: 'Les informations de préinscription sont invalides.' });
  }

  const siteUrl = process.env.URL;
  const emailsSecret = process.env.NETLIFY_EMAILS_SECRET;
  if(!siteUrl || !emailsSecret){
    console.error('Netlify Email Integration is not configured for pre-registration confirmations.');
    return jsonResponse(503, { error: 'Le service de courriel est temporairement indisponible.' });
  }

  let emailResponse;
  try {
    emailResponse = await fetch(`${siteUrl}/.netlify/functions/emails/${EMAIL_TEMPLATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'netlify-emails-secret': emailsSecret,
      },
      body: JSON.stringify({
        from: CLUB_EMAIL,
        to: email,
        subject: EMAIL_SUBJECT,
        parameters: { prenom },
      }),
    });
  } catch(error) {
    console.error('Unable to reach the Netlify email handler:', error);
    return jsonResponse(502, { error: 'Le courriel de confirmation n’a pas pu être envoyé.' });
  }

  if(!emailResponse.ok){
    const errorDetails = (await emailResponse.text()).slice(0, 1000);
    console.error(`Netlify email handler returned status ${emailResponse.status}: ${errorDetails}`);
    return jsonResponse(502, { error: 'Le courriel de confirmation n’a pas pu être envoyé.' });
  }

  return jsonResponse(200, { sent: true });
}
