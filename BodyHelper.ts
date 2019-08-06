class BodyHelper {
  constructor(body: Body) {
    this.body = body;
  }
  append(element: DocumentElement) {
    // Have to separate these out first, otherwise the typescript compiler gets confused
    const PARAGRAPH = DocumentApp.ElementType.PARAGRAPH;
    const TABLE = DocumentApp.ElementType.TABLE;
    const LIST_ITEM = DocumentApp.ElementType.LIST_ITEM;
    const APPEND_METHODS = {
      PARAGRAPH: 'appendParagraph',
      TABLE: 'appendTable',
      LIST_ITEM: 'appendListItem',
    };
    (this.body[APPEND_METHODS[element.getType()])(element);
  }
  getBody(): Body {
    return this.body;
  }
}

export { BodyHelper };
