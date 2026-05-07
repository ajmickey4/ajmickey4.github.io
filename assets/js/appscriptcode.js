const ALLOWED_ORIGINS = [
  "http://127.0.0.1:4000",
  "http://localhost:4000",
  "https://ajmickey4.github.io"
];

const SHEET_NAME = "Guests";
const RSVP_CUTOFF = new Date(2026, 11, 18, 23, 59, 59); // December 18, 2026 at 11:59:59 PM

function isRsvpOpen() {
  return new Date() < RSVP_CUTOFF;
}

function closedResponse() {
  return {
    closed: true,
    error: "RSVPs are no longer being accepted after November 18, 2026."
  };
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    if (!isRsvpOpen()) {
      return ContentService.createTextOutput(JSON.stringify(closedResponse()))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 1. SECURITY: Check Origin
    // Note: You must send 'origin: window.location.origin' in your frontend AJAX data
    const origin = e.parameter.origin;
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Origin not allowed" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const params = e.parameter;
    const action = params.action;
    
    let result = {};

    if (action === "lookup") {
      result = handleLookup(sheet, params);
    } 
    else if (action === "submit") {
      result = handleSubmit(sheet, params, origin); // Pass origin to generate link
    } 
    else {
      result = { error: "Unknown action" };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function handleLookup(sheet, params) {
  const reqFirst = normalize(params.first_name);
  const reqLast = normalize(params.last_name);
  
  const data = sheet.getDataRange().getValues();
  let foundPartyId = null;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowFirst = normalize(row[1]); 
    const rowLast = normalize(row[2]); 
    
    if (rowFirst === reqFirst && rowLast === reqLast) {
      foundPartyId = row[0];
      break;
    }
  }

  if (foundPartyId === null) {
    return { found: false };
  }

  const contact = getPartyContact(data, foundPartyId);

  const guests = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] == foundPartyId) { 
      guests.push({
        row: i + 1,
        first: row[1],
        last: row[2],
        isAttending: row[3] === true || row[3] === "TRUE"
      });
    }
  }

  return {
    found: true,
    partyId: foundPartyId,
    guests: guests,
    contact: contact
  };
}

function getPartyContact(data, partyId) {
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] == partyId && row[4]) {
      return row[4];
    }
  }

  return "";
}

function handleSubmit(sheet, params, origin) {
  if (!isRsvpOpen()) {
    return closedResponse();
  }

  const partyId = params.partyId;
  const contact = params.contact;
  const attendanceMap = params.attendance ? JSON.parse(params.attendance) : {};

  const data = sheet.getDataRange().getValues();
  const timestamp = new Date();
  
  // Track changes for the email summary
  let updatedGuests = [];

  for (let i = 1; i < data.length; i++) {
    const rowParts = data[i];
    
    if (rowParts[0] == partyId) {
      const rowIndex = i + 1;
      const isAttending = attendanceMap.hasOwnProperty(rowIndex.toString());
      
      sheet.getRange(rowIndex, 4).setValue(isAttending ? "TRUE" : "FALSE"); 
      sheet.getRange(rowIndex, 5).setValue(contact); 
      sheet.getRange(rowIndex, 6).setValue(timestamp); 
      
      updatedGuests.push({
        firstname:`${rowParts[1]}`,
        lastname: `${rowParts[2]}`,
        status: isAttending ? "Attending" : "Not Attending"
      });
    }
  }

  // 2. EMAIL: Send Confirmation if contact is an email
  if (contact && contact.includes("@")) {
    sendConfirmationEmail(contact, updatedGuests, origin);
  }

  return { success: true };
}

function sendConfirmationEmail(email, guests, origin) {
  const subject = "Wedding RSVP Confirmation";

  // --- BUILD THE GUEST LIST TABLE ---
  
  // 1. Open the container div (rounded border) and the table
  let guestListHtml = `
    <div style="border: 2px solid #c9c9c9; border-radius: 12px; overflow: hidden;">
      <table width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; border-collapse: collapse; font-family: 'Comfortaa', sans-serif;">
        
        <thead>
          <tr>
            <th align="left" style="padding: 15px 25px; border-bottom: 2px solid #c9c9c9; color: #141414; font-size: 16px;">Guest Name</th>
            <th align="right" style="padding: 15px 25px; border-bottom: 2px solid #c9c9c9; color: #141414; font-size: 16px; text-align: center; width: 84px;">Attending?</th>
          </tr>
        </thead>
        <tbody>
  `;

  // 2. Loop through guests to create rows
  guests.forEach((g, index) => {
    // Determine Text (Yes/No) and Color (Green/Brown/Gray)
    // We check against 'Attending' string or boolean true
    const isAttending = (g.status === "Attending" || g.status === true);
    
    const statusText = isAttending ? "Yes" : "No";
    
    // Using your CSS variable colors: Green for Yes, Brown (or Gray) for No
    const statusColor = isAttending ? "#4C8041" : "#785331"; 
    
    // Determine if we need a bottom border (we don't need one on the very last row)
    const borderStyle = (index === guests.length - 1) ? "" : "border-bottom: 2px solid #c9c9c9;";

    guestListHtml += `
      <tr>
        <td align="left" style="padding: 17px 25px; color: #444; font-size: 15px; ${borderStyle}">
          ${g.firstname} ${g.lastname}
        </td>
        <td align="right" style="padding: 17px 25px; font-weight: bold; color: ${statusColor}; font-size: 15px; ${borderStyle} text-align: center;">
          ${statusText}
        </td>
      </tr>
    `;
  });

  // 3. Close the table and container
  guestListHtml += `
        </tbody>
      </table>
    </div>
  `;

  // --- BUILD THE FULL EMAIL BODY ---

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #eaedf0; font-family: 'Comfortaa', Helvetica, Arial, sans-serif;">
      
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eaedf0; padding: 40px 0;">
        <tr>
          <td align="center">
            
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <tr>
                <td style="padding: 40px;">
                  
                  <h2 style="margin-top: 0; margin-bottom: 30px; color: #141414; font-size: 24px; font-weight: bold; text-align: center;">
                    <span style="border-bottom: 2px solid #2896af; padding-bottom: 10px;">Thank you for your RSVP!</span>
                  </h2>

                  <p style="color: #444444; font-size: 16px; line-height: 1.5; text-align: center; margin-bottom: 30px;">
                    We have received your response. Here are the details we recorded:
                  </p>

                  ${guestListHtml}

                  <br/><br/>

                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding: 0 5px;">
                        <p style="color: #7e7e7e; font-size: 14px; margin-bottom: 15px;">Need to make changes?</p>
                        <a href="${origin}/wedding/rsvp?firstname=${guests[0].firstname}&lastname=${guests[0].lastname}" 
                           style="background-color: #2896af; color: #ffffff; padding: 14px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                           Update Your RSVP
                        </a>
                      </td>
                      <td align="center" style="padding: 0 5px;">
                        <p style="color:#7e7e7e;font-size:14px;margin-bottom:15px">Use Google Calendar?</p>
                        <a href="https://calendar.google.com/calendar/u/7?cid=ZmFpdGh3ZWRkaW5nMjZAZ21haWwuY29t" style="background-color:#2896af;color:#ffffff;padding:14px 18px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block" target="_blank" data-saferedirecturl="https://calendar.google.com/calendar/u/7?cid=ZmFpdGh3ZWRkaW5nMjZAZ21haWwuY29t">Add to Calendar</a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>            

            </table>
            
            <div style="padding-top: 20px; color: #7e7e7e; font-size: 12px;">
               Sent via Mickey Wedding RSVP System
             </div>

          </td>
        </tr>
      </table>
      
    </body>
    </html>
  `;

  GmailApp.sendEmail(email, subject, "Please enable HTML to view this email.", {
    htmlBody: htmlBody
  });
}

function normalize(str) {
  return str ? str.toString().trim().toLowerCase() : "";
}

function doGet(e) {
   return ContentService.createTextOutput("RSVP App Script is Online.");
} 