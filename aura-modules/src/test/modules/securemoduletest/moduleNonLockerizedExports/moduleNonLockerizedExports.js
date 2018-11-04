export const BOOLEAN = true;
export const NULL = null;
export const UNDEFINED = undefined;
export const NUMBER = 100;
export const STRING = 'Hello!';
export const SYMBOL = Symbol('ABC');

export const WINDOW = window;
export const DOCUMENT = document;
export const ELEMENT = document.createElement('DIV');

export const OBJECT = {
  'win': window,
  'doc': document,
  'el': document.createElement('DIV'),
  'winFunction': function() { return window; },
  'docFunction': function() { return document; },
  'elFunction': function() { return document.createElement('DIV'); },
  'winThisContextFunction': function() { return this.win; },
  'docThisContextFunction': function() { return this.doc; },
  'elThisContextFunction': function() { return this.el; }
};

export function getWindow() {
  return window;
}
export function getDocument() {
  return document;
}
export function getElement() {
  return document.createElement('DIV');
}
export function getObject() {
  return OBJECT;
}
export function getWindowFunction() {
  return function() { return window; };
}
export function getDocumentFunction() {
  return function() { return document; };
}
export function getElementFunction() {
  return function() { return document.createElement('DIV'); };
}
export function getObjectFunction() {
  return function() { return OBJECT; };
}

let winReturn, docReturn, elReturn;
export function getWindowReturn(win) {
  winReturn = win;
  return winReturn;
}
export function getDocumentReturn(doc) {
  docReturn = doc;
  return docReturn;
}
export function getElementReturn(el) {
  elReturn = el;
  return elReturn;
}
export function getWindowReturnFunction(win) {
  winReturn = win();
  return winReturn;
}
export function getDocumentReturnFunction(doc) {
  docReturn = doc();
  return docReturn;
}
export function getElementReturnFunction(el) {
  elReturn = el();
  return elReturn;
}

// export default function* () {
//   yield window;
//   yield document;
//   yield document.createElement('');
//   return 'Default!';
// }
