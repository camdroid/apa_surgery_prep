function createCopyOfDoc(sourceDocID) {
  // Create a new document from the template, and return the new document's ID
  return DriveApp.getFileById(sourceDocID).makeCopy().getId();
}

function parseAnimalData(animalData, spreadsheetHeaders) {
  if (spreadsheetHeaders == null || animalData == null || spreadsheetHeaders.length !== animalData.length) {
    log("Header length doesn't match data length", true);
  }
  parsedAnimalData = {};
  for (var i=0; i<spreadsheetHeaders.length; i++) {
     parsedAnimalData[spreadsheetHeaders[i]] = animalData[i];
  }
  return parsedAnimalData;
}

function insertDataIntoTemplate(template, data) {
  Object.keys(data).forEach(function someName(field) {
    template.replaceText(Utilities.formatString("{{%s}}", field), data[field])
  });
}

function log(data, debug) {
  if (debug == null) {
    debug = true;
  }
  if (debug) {
    Logger.log(data);
  }
}

function today() {
  return Utilities.formatDate(new Date(), "CDT", "YYYY-MM-dd");
}

function generateSurgeryDoc() {
  SPREADSHEET_DATA_ID = "1PYatshebqAXaRoiEfJqvj_0jIyWADJq7YxrrBfn1XzE";
  TEMPLATE_DOC_ID = "11tKJlCMqgxm7yzJD8SvbmsQjOI8X2DHx2INjtAfU7uk";
  OUTPUT_FOLDER_ID = '15bnax8_qG8rjOV5uHqb8pGSl5u4lTp0s';

//  docName = Utilities.formatString("APA Surgery Note %s", today());

  allAnimalData = Sheets.Spreadsheets.Values.get(SPREADSHEET_DATA_ID, "A2:T");
  spreadsheetHeaders = Sheets.Spreadsheets.Values.get(SPREADSHEET_DATA_ID, "A1:1").values[0];

  outputFolder = DriveApp.getFolderById(OUTPUT_FOLDER_ID);

  for(var i=0; i<allAnimalData.values.length; i++) {
    templateID = DriveApp.getFileById(TEMPLATE_DOC_ID).makeCopy('output'+i, outputFolder).getId();
    templateBody = DocumentApp.openById(templateID).getBody();
    structuredData = parseAnimalData(allAnimalData.values[i], spreadsheetHeaders);
    templatedData = insertDataIntoTemplate(templateBody, structuredData);
    templateBody.replaceText("{{Date}}", today());
  }
}
