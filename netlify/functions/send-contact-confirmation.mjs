function jsonResponse(status, payload){
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function getAppsScriptResponse(appsScriptUrl, payload){
  const response = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    redirect: 'manual',
  });
  if(response.status < 300 || response.status >= 400) return response;

  const redirectLocation = response.headers.get('location');
  if(!redirectLocation) throw new Error('Google Apps Script returned a redirect without a location.');
  const redirectUrl = new URL(redirectLocation, appsScriptUrl);
  if(redirectUrl.protocol !== 'https:' || !redirectUrl.hostname.endsWith('.googleusercontent.com')){
    throw new Error('Google Apps Script returned an unexpected redirect destination.');
  }
  return fetch(redirectUrl);
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

  const fields = submission?.fields;
  const email = typeof fields?.email === 'string' ? fields.email.trim() : '';
  const firstName = typeof fields?.prenom === 'string' ? fields.prenom.trim() : '';
  const lastName = typeof fields?.nom === 'string' ? fields.nom.trim() : '';
  const subject = typeof fields?.sujet === 'string' ? fields.sujet.trim() : '';
  const message = typeof fields?.message === 'string' ? fields.message.trim() : '';
  if(!fields || typeof fields !== 'object' || Array.isArray(fields) ||
    submission.botField !== '' ||
    !email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !firstName || firstName.length > 100 ||
    !lastName || lastName.length > 100 ||
    !subject || subject.length > 150 ||
    !message || message.length > 5000){
    return jsonResponse(400, { error: 'Les informations du formulaire de contact sont invalides.' });
  }

  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const appsScriptToken = process.env.GOOGLE_APPS_SCRIPT_TOKEN;
  if(!appsScriptUrl || !appsScriptToken){
    console.error('Google Apps Script is not configured for contact confirmations.');
    return jsonResponse(503, { error: 'Le service de confirmation par e-mail est indisponible.' });
  }

  try {
    const scriptUrl = new URL(appsScriptUrl);
    if(scriptUrl.protocol !== 'https:' || scriptUrl.hostname !== 'script.google.com' ||
      !scriptUrl.pathname.startsWith('/macros/s/') || !scriptUrl.pathname.endsWith('/exec')){
      throw new Error('GOOGLE_APPS_SCRIPT_URL must be a Google Apps Script web app /exec URL.');
    }

    const appsScriptResponse = await getAppsScriptResponse(appsScriptUrl, {
      action: 'contact-confirmation',
      token: appsScriptToken,
      fields: { email, prenom: firstName, nom: lastName, sujet: subject, message },
    });
    if(!appsScriptResponse.ok){
      const errorDetails = (await appsScriptResponse.text()).slice(0, 1000);
      throw new Error(`Google Apps Script returned status ${appsScriptResponse.status}: ${errorDetails}`);
    }

    const result = await appsScriptResponse.json();
    if(result.emailSent === true) return jsonResponse(200, { confirmationSent: true });
    if(result.error === 'rate_limited'){
      return jsonResponse(429, { error: 'Une confirmation vient déjà d’être envoyée à cette adresse.' });
    }
    throw new Error(`Google Apps Script did not send the contact confirmation: ${result.error || 'unknown error'}`);
  } catch(error) {
    console.error('Unable to send contact confirmation with Google Apps Script:', error);
    return jsonResponse(502, { error: 'Le message a été transmis, mais l’e-mail de confirmation n’a pas pu être envoyé.' });
  }
}
