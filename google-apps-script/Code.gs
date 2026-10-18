const FIELD_COLUMNS = [
  ['genre', 'Genre'],
  ['nom', 'Nom'],
  ['prenom', 'Prénom'],
  ['naissance', 'Date de naissance'],
  ['paysNaissance', 'Pays de naissance'],
  ['paysNationalite', 'Pays de nationalité'],
  ['clubEtranger', 'Club étranger'],
  ['habiteEtranger', 'Résidence à l’étranger'],
  ['email', 'Adresse e-mail'],
];
const CLUB_EMAIL = '581835@lpiff.fr';

function authorizePreRegistrationServices() {
  const properties = PropertiesService.getScriptProperties();
  const folderId = properties.getProperty('DRIVE_FOLDER_ID');
  if (!folderId) throw new Error('DRIVE_FOLDER_ID is not configured.');

  DriveApp.getFolderById(folderId).getName();
  MailApp.getRemainingDailyQuota();
  const spreadsheetId = properties.getProperty('SHEET_ID');
  if (spreadsheetId) SpreadsheetApp.openById(spreadsheetId).getName();
}

function doPost(event) {
  try {
    const request = JSON.parse(event.postData.contents);
    const properties = PropertiesService.getScriptProperties();
    const expectedToken = properties.getProperty('API_TOKEN');
    if (!expectedToken || request.token !== expectedToken) {
      return jsonResponse({ saved: false, error: 'unauthorized' });
    }

    if (request.action === 'contact-confirmation') {
      return sendContactConfirmation(request.fields);
    }

    const fields = request.fields;
    if (
      !fields ||
      FIELD_COLUMNS.some(([key]) => typeof fields[key] !== 'string' || fields[key].length > 254) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) ||
      !fields.prenom.trim()
    ) {
      return jsonResponse({ saved: false, error: 'invalid_submission' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getRegistrationSheet(properties);
      const values = [
        new Date(),
        ...FIELD_COLUMNS.map(([key]) => safeCellValue(fields[key].trim())),
      ];
      sheet.appendRow(values);
      sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).setNumberFormat('dd/mm/yyyy hh:mm');
    } finally {
      lock.releaseLock();
    }

    const firstName = fields.prenom.trim();
    const escapedFirstName = escapeHtml(firstName);
    const subject = 'Votre demande de préinscription a bien été reçue';
    const textBody = `Bonjour ${firstName},\n\nNous confirmons la bonne réception de votre demande de préinscription au Boussy Quincy FC.\n\nCette confirmation atteste uniquement de la réception de votre demande. Elle ne vaut pas validation de l’inscription. Le club reviendra vers vous après étude de votre demande et des places disponibles.\n\nSportivement,\nL'équipe du Boussy-Quincy FC`;
    const htmlBody = `<p>Bonjour ${escapedFirstName},</p><p>Nous confirmons la bonne réception de votre demande de préinscription au Boussy Quincy FC.</p><p>Cette confirmation atteste uniquement de la réception de votre demande. Elle ne vaut pas validation de l’inscription. Le club reviendra vers vous après étude de votre demande et des places disponibles.</p><p>Sportivement,<br>L'équipe du Boussy-Quincy FC</p>`;
    try {
      MailApp.sendEmail({
        to: fields.email.trim(),
        subject,
        body: textBody,
        htmlBody,
        name: 'Boussy Quincy FC',
        replyTo: CLUB_EMAIL,
      });
      return jsonResponse({ saved: true, emailSent: true });
    } catch (error) {
      console.error(`Registration saved but confirmation email failed: ${error}`);
      return jsonResponse({ saved: true, emailSent: false, error: 'email_failed' });
    }
  } catch (error) {
    console.error(`Unable to save registration: ${error}`);
    return jsonResponse({ saved: false, emailSent: false, error: 'save_failed' });
  }
}

function sendContactConfirmation(fields) {
  if (
    !fields ||
    typeof fields.email !== 'string' || fields.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()) ||
    typeof fields.prenom !== 'string' || !fields.prenom.trim() || fields.prenom.length > 100 ||
    typeof fields.nom !== 'string' || !fields.nom.trim() || fields.nom.length > 100 ||
    typeof fields.sujet !== 'string' || !fields.sujet.trim() || fields.sujet.length > 150 ||
    typeof fields.message !== 'string' || !fields.message.trim() || fields.message.length > 5000
  ) {
    return jsonResponse({ saved: false, emailSent: false, error: 'invalid_submission' });
  }

  const recipient = fields.email.trim();
  const rateLimitKey = `contact-confirmation-${Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, recipient.toLowerCase())
  )}`;
  const cache = CacheService.getScriptCache();
  if (cache.get(rateLimitKey)) {
    return jsonResponse({ saved: false, emailSent: false, error: 'rate_limited' });
  }

  const firstName = fields.prenom.trim();
  const escapedFirstName = escapeHtml(firstName);
  const escapedSubject = escapeHtml(fields.sujet.trim());
  const subject = 'Nous avons bien reçu votre message — Boussy Quincy FC';
  const textBody = `Bonjour ${firstName},\n\nNous vous confirmons la bonne réception de votre message au sujet de « ${fields.sujet.trim()} ».\n\nLe club en prendra connaissance et vous répondra dès que possible.\n\nSportivement,\nL'équipe du Boussy-Quincy FC`;
  const htmlBody = `<p>Bonjour ${escapedFirstName},</p><p>Nous vous confirmons la bonne réception de votre message au sujet de « ${escapedSubject} ».</p><p>Le club en prendra connaissance et vous répondra dès que possible.</p><p>Sportivement,<br>L'équipe du Boussy-Quincy FC</p>`;

  try {
    MailApp.sendEmail({
      to: recipient,
      subject,
      body: textBody,
      htmlBody,
      name: 'Boussy Quincy FC',
      replyTo: CLUB_EMAIL,
    });
    cache.put(rateLimitKey, 'sent', 60);
    return jsonResponse({ saved: true, emailSent: true });
  } catch (error) {
    console.error(`Contact confirmation email failed: ${error}`);
    return jsonResponse({ saved: false, emailSent: false, error: 'email_failed' });
  }
}

function getRegistrationSheet(properties) {
  const spreadsheetId = properties.getProperty('SHEET_ID');
  let spreadsheet;
  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    const folderId = properties.getProperty('DRIVE_FOLDER_ID');
    if (!folderId) throw new Error('DRIVE_FOLDER_ID is not configured.');

    spreadsheet = SpreadsheetApp.create('Préinscriptions — Boussy Quincy FC');
    DriveApp.getFileById(spreadsheet.getId()).moveTo(DriveApp.getFolderById(folderId));
    properties.setProperty('SHEET_ID', spreadsheet.getId());
  }

  const sheet = spreadsheet.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Date de réception', ...FIELD_COLUMNS.map(([, label]) => label)]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function safeCellValue(value) {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
