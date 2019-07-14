function createCopyOfDoc(sourceDocID) {
  // Create a new document from the template, and return the new document's ID 
  return DriveApp.getFileById(sourceDocID).makeCopy().getId();
}

function parseAnimalData(animalData) {
  Logger.log("Starting to parse animal data");
  Logger.log(animalData); 
  Logger.log("Done parsing animal data");
}

function insertDataIntoTemplate(template, data) {
  return template;
}

function generateSurgeryDoc() {
  SPREADSHEET_DATA_ID = "1PYatshebqAXaRoiEfJqvj_0jIyWADJq7YxrrBfn1XzE";
  TEMPLATE_DOC_ID = "11tKJlCMqgxm7yzJD8SvbmsQjOI8X2DHx2INjtAfU7uk";
  
  newTemplateID = createCopyOfDoc(TEMPLATE_DOC_ID);
  resultFile = DriveApp.getFileById(newTemplateID);
  docName = Utilities.formatString("APA Surgery Note %s", Utilities.formatDate(new Date(), "CDT", "YYYY-MM-dd"));
  resultFile.setName(docName);
  Logger.log({"step": "Created new doc", "docID": newTemplateID});
  allAnimalData = Sheets.Spreadsheets.Values.get(SPREADSHEET_DATA_ID, "A2:T");
  Logger.log({"step": "Fetch data", "data": allAnimalData});
  
  templateBody = DocumentApp.openById(TEMPLATE_DOC_ID).getBody();
  
  for(var i=0; i<allAnimalData.values.length; i++) {
    structuredData = parseAnimalData(allAnimalData.values[i]);
    templatedData = insertDataIntoTemplate(templateBody, structuredData);
  }
}

