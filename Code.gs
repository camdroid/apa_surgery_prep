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
    log('Replacing ' + field + ' with ' + data[field]);
    template.replaceText(Utilities.formatString("{{%s}}", field), data[field]);
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

function mergeFilesInFolder(folder_id) {
  log("Merging files");
  folder = DriveApp.getFolderById(folder_id);
  files = folder.getFiles();
  docIDs = [];

  while (files.hasNext()){
    file = files.next();
    docIDs.push(file.getId());
  }

  //Shamelessly copied from
  // https://stackoverflow.com/questions/29032656/google-app-script-merge-multiple-documents-remove-all-line-breaks-and-sent-as
  // Create new aggregated doc
  // TODO This creates a doc in the root directory, should really figure out how to fix that.
  // When I try using folder.createFile, the resulting file is inaccessible to the rest of the code.
  docName = Utilities.formatString("APA Surgery Note %s", today());
  baseDocId = DocumentApp.create(docName).getId();
  var baseDoc = DocumentApp.openById(baseDocId);
  // clear the whole document and start with empty page
  baseDoc.getBody().clear();
  var body = baseDoc.getActiveSection();
  const sideMargin = 30;
  body.setMarginLeft(sideMargin);
  body.setMarginRight(sideMargin);
  body.setMarginTop(30);

  for (var i = 0; i < docIDs.length; ++i ) {
    var otherBody = DocumentApp.openById(docIDs[i]).getActiveSection();
    var totalElements = otherBody.getNumChildren();
    for( var j = 0; j < totalElements; ++j ) {
      var element = otherBody.getChild(j).copy();
      var type = element.getType();
      if( type == DocumentApp.ElementType.PARAGRAPH )
        body.appendParagraph(element);
      else if( type == DocumentApp.ElementType.TABLE )
        body.appendTable(element);
      else if( type == DocumentApp.ElementType.LIST_ITEM )
        body.appendListItem(element);
      else
        throw new Error("Unknown element type: "+type);
    }
    body.appendPageBreak();
  }
}

function generateSurgeryDoc() {
  SPREADSHEET_DATA_ID = "1PYatshebqAXaRoiEfJqvj_0jIyWADJq7YxrrBfn1XzE";
  TEMPLATE_DOC_ID = "11tKJlCMqgxm7yzJD8SvbmsQjOI8X2DHx2INjtAfU7uk";
  OUTPUT_FOLDER_ID = '15bnax8_qG8rjOV5uHqb8pGSl5u4lTp0s';

  allAnimalData = Sheets.Spreadsheets.Values.get(SPREADSHEET_DATA_ID, "A2:T");
  spreadsheetHeaders = Sheets.Spreadsheets.Values.get(SPREADSHEET_DATA_ID, "A1:1").values[0];

  outputFolder = DriveApp.getFolderById(OUTPUT_FOLDER_ID);

  for(var i=0; i<allAnimalData.values.length; i++) {
    structuredData = parseAnimalData(allAnimalData.values[i], spreadsheetHeaders);

    templateID = DriveApp.getFileById(TEMPLATE_DOC_ID).makeCopy('output'+i, outputFolder).getId();
    templateBody = DocumentApp.openById(templateID).getBody();
    insertDataIntoTemplate(templateBody, structuredData);
    templateBody.replaceText("{{Date}}", today());
  }
  mergeFilesInFolder(OUTPUT_FOLDER_ID);
}
