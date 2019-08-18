// APA Surgery Prep

import {BodyHelper} from "./BodyHelper";

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
  Object.keys(data).forEach(field => {
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

const today = () => Utilities.formatDate(new Date(), "CDT", "YYYY-MM-dd");

function moveFileToFolder(file_id, folder_id): null {
  folder = DriveApp.getFolderById(folder_id);
  baseDocFile = DriveApp.getFileById(baseDocId);

  folder.addFile(baseDocFile);
  DriveApp.getRootFolder().removeFile(baseDocFile);
}

function initEndDocument(docId) {
  var baseDoc = DocumentApp.openById(baseDocId);
  baseDoc.getBody().clear();
  const margin = 30;
  var body = baseDoc.getActiveSection();
  body.setMarginLeft(margin);
  body.setMarginRight(margin);
  body.setMarginTop(margin);
  body.setMarginBottom(margin);

  return body;
}

function createEndDocument(folder_id): Body {
  docName = Utilities.formatString("APA Surgery Note %s", today());
  baseDocId = DocumentApp.create(docName).getId();
  moveFileToFolder(baseDocId, folder_id);
  return baseDocId;
}

function mergeFilesInFolder(folder_id: number) {
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

  // clear the whole document and start with empty page
  var finalDocId = createEndDocument(folder_id);
  var body = initEndDocument(finalDocId);

  const bodyHelper = new BodyHelper(body);

  docIDs.forEach(docID => {
    var otherBody = DocumentApp.openById(docID).getActiveSection().copy();
    for( var j = 0; j < otherBody.getNumChildren(); ++j ) {
      var element = otherBody.getChild(j).copy();
      bodyHelper.append(element);
    }
    body.appendPageBreak();
  }
  return finalDocId;
}

function generateSurgeryDoc() {
  apalibrary.logHelloWorld();
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
  var finalDocId = mergeFilesInFolder(OUTPUT_FOLDER_ID);
  showUserLinkToDocument(finalDocId);
}

function showUserLinkToDocument(docId) {
  docUrl = 'https://docs.google.com/document/d/' + docId + '/edit';
  html = HtmlService.createHtmlOutput('<a href="' + docUrl + '">Open Document Here</a>')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showModalDialog(html, 'Right-click to open');
}

function onOpen(e) {
  var menu = SpreadsheetApp.getUi().createMenu('Surgery Prep');
  menu.addItem('Generate Surgery Docs', 'generateSurgeryDoc');
  menu.addToUi();
}
