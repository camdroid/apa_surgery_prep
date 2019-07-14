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
  return template;
}

function log(data, debug) {
  if (debug == null) {
    debug = false;
  }
  if (debug) {
    Logger.log(data);
  }
}

function generateSurgeryDoc() {
  SPREADSHEET_DATA_ID = "1PYatshebqAXaRoiEfJqvj_0jIyWADJq7YxrrBfn1XzE";
  TEMPLATE_DOC_ID = "11tKJlCMqgxm7yzJD8SvbmsQjOI8X2DHx2INjtAfU7uk";

  newTemplateID = createCopyOfDoc(TEMPLATE_DOC_ID);
  resultFile = DriveApp.getFileById(newTemplateID);
  docName = Utilities.formatString("APA Surgery Note %s", Utilities.formatDate(new Date(), "CDT", "YYYY-MM-dd"));
  resultFile.setName(docName);

  allAnimalData = Sheets.Spreadsheets.Values.get(SPREADSHEET_DATA_ID, "A2:T");

  templateBody = DocumentApp.openById(TEMPLATE_DOC_ID).getBody();
  spreadsheetHeaders = Sheets.Spreadsheets.Values.get(SPREADSHEET_DATA_ID, "A1:1").values[0];

  for(var i=0; i<allAnimalData.values.length; i++) {
    structuredData = parseAnimalData(allAnimalData.values[i], spreadsheetHeaders);
    templatedData = insertDataIntoTemplate(templateBody, structuredData);
  }
}

