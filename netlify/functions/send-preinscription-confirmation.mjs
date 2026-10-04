const REGISTRATION_FIELDS = [
  'genre',
  'nom',
  'prenom',
  'naissance',
  'paysNaissance',
  'paysNationalite',
  'clubEtranger',
  'habiteEtranger',
  'email',
];

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

  if(!submission || typeof submission !== 'object' || Array.isArray(submission)){
    return jsonResponse(400, { error: 'Requête invalide.' });
  }

  const fields = submission.fields && typeof submission.fields === 'object' && !Array.isArray(submission.fields)
    ? submission.fields
    : null;
  const email = fields && typeof fields.email === 'string' ? fields.email.trim() : '';
  const prenom = fields && typeof fields.prenom === 'string' ? fields.prenom.trim() : '';
  const botField = typeof submission.botField === 'string' ? submission.botField.trim() : null;
  if(!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !prenom || prenom.length > 100 || botField !== '' ||
    !fields || REGISTRATION_FIELDS.some(field =>
      typeof fields[field] !== 'string' || fields[field].length > (field === 'email' ? 254 : 200)
    )){
    return jsonResponse(400, { error: 'Les informations de préinscription sont invalides.' });
  }

  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const appsScriptToken = process.env.GOOGLE_APPS_SCRIPT_TOKEN;
  if(!appsScriptUrl || !appsScriptToken){
    console.error('Google Apps Script is not configured for pre-registration processing.');
    return jsonResponse(200, { sheetSaved: false, confirmationSent: false });
  }

  try {
    const scriptUrl = new URL(appsScriptUrl);
    if(scriptUrl.protocol !== 'https:' || scriptUrl.hostname !== 'script.google.com' ||
      !scriptUrl.pathname.startsWith('/macros/s/') || !scriptUrl.pathname.endsWith('/exec')){
      throw new Error('GOOGLE_APPS_SCRIPT_URL must be a Google Apps Script web app /exec URL.');
    }

    const appsScriptResponse = await getAppsScriptResponse(appsScriptUrl, {
      token: appsScriptToken,
      fields: Object.fromEntries(REGISTRATION_FIELDS.map(field => [field, fields[field].trim()])),
    });
    if(!appsScriptResponse.ok){
      const errorDetails = (await appsScriptResponse.text()).slice(0, 1000);
      throw new Error(`Google Apps Script returned status ${appsScriptResponse.status}: ${errorDetails}`);
    }

    const result = await appsScriptResponse.json();
    if(typeof result.saved !== 'boolean' || typeof result.emailSent !== 'boolean'){
      throw new Error('Google Apps Script returned an invalid processing result.');
    }
    return jsonResponse(200, {
      sheetSaved: result.saved,
      confirmationSent: result.emailSent,
    });
  } catch(error) {
    console.error('Unable to process pre-registration with Google Apps Script:', error);
    return jsonResponse(200, { sheetSaved: false, confirmationSent: false });
  }
}
