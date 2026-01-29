function doGet(e) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  const sessions = rows.map(row => {
    return {
      id: row[0],
      studentName: row[1],
      subject: row[2],
      startTime: row[3],
      durationMinutes: row[4],
      rate: row[5],
      status: row[6],
      notes: row[7],
      createdAt: row[8]
    };
  });

  return ContentService.createTextOutput(JSON.stringify(sessions))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = getSheet();
  const rawData = JSON.parse(e.postData.contents);
  const action = rawData.action;
  const payload = rawData.payload;

  if (action === 'create') {
    sheet.appendRow([
      payload.id,
      payload.studentName,
      payload.subject,
      payload.startTime,
      payload.durationMinutes,
      payload.rate,
      payload.status,
      payload.notes || '',
      payload.createdAt
    ]);
  } 
  
  else if (action === 'update') {
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] == payload.id); // Find by ID
    
    if (rowIndex > 0) { // 1-based index in sheet operations, but index from find is 0-based relative to array.
       // data includes header, so rowIndex 1 is actually row 2 in sheet.
       // But wait, data[rowIndex] matches. The Row number is rowIndex + 1.
       const rowNum = rowIndex + 1;
       
       sheet.getRange(rowNum, 2).setValue(payload.studentName);
       sheet.getRange(rowNum, 3).setValue(payload.subject);
       sheet.getRange(rowNum, 4).setValue(payload.startTime);
       sheet.getRange(rowNum, 5).setValue(payload.durationMinutes);
       sheet.getRange(rowNum, 6).setValue(payload.rate);
       sheet.getRange(rowNum, 7).setValue(payload.status);
       sheet.getRange(rowNum, 8).setValue(payload.notes || '');
       // createdAt (9) usually doesn't change
    }
  }
  
  else if (action === 'delete') {
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] == payload.id);
    if (rowIndex > 0) {
      sheet.deleteRow(rowIndex + 1);
    }
  }

  // Return updated list
  return doGet();
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Sessions');
  if (!sheet) {
    sheet = ss.insertSheet('Sessions');
    sheet.appendRow(['id', 'studentName', 'subject', 'startTime', 'durationMinutes', 'rate', 'status', 'notes', 'createdAt']);
  }
  return sheet;
}
