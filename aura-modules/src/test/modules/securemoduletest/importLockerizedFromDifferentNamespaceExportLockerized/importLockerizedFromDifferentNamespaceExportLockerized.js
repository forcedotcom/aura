import { LightningElement, api } from 'lwc';
import * as testUtil from 'securemoduletest/testUtil';
import {
    BOOLEAN,
    NULL,
    UNDEFINED,
    NUMBER,
    STRING,
    SYMBOL,
    WINDOW,
    DOCUMENT,
    ELEMENT,
    OBJECT,
    getWindow,
    getDocument,
    getElement,
    getObject,
    getWindowFunction,
    getDocumentFunction,
    getElementFunction,
    getObjectFunction,
    getWindowReturn,
    getDocumentReturn,
    getElementReturn,
    getWindowReturnFunction,
    getDocumentReturnFunction,
    getElementReturnFunction
} from 'secureothernamespace/moduleNonLockerizedExports';

export default class ImportLockerizedFromDifferentNamespaceExportLockerized extends LightningElement {
    @api NAME = 'ImportLockerizedFromDifferentNamespaceExportLockerized { NS: "securemoduletest" }';
    @api COMPONENT = 'Lockerized! [Import]';

    @api
    testPrimitives() {
        testUtil.assertEquals(true, BOOLEAN);
        testUtil.assertEquals(null, NULL);
        testUtil.assertEquals(undefined, UNDEFINED);
        testUtil.assertEquals(100, NUMBER);
        testUtil.assertEquals('Hello!', STRING);
        testUtil.assertEquals('Symbol(ABC)', SYMBOL.toString());
    }

    @api
    testObjects() {
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', WINDOW.toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', DOCUMENT.toString());
        testUtil.assertEquals('SecureObject: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', ELEMENT.toString());
        this.testObject(OBJECT);
    }

    testObject(obj) {
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', obj.win.toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', obj.doc.toString());
        testUtil.assertEquals('SecureObject: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', obj.el.toString());
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', obj.winFunction().toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', obj.docFunction().toString());
        testUtil.assertEquals('SecureObject: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', obj.elFunction().toString());
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', obj.winThisContext.toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', obj.docThisContext.toString());
        testUtil.assertEquals('SecureObject: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', obj.elThisContext.toString());
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', obj.winThisContextFunction().toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', obj.docThisContextFunction().toString());
        testUtil.assertEquals('SecureObject: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', obj.elThisContextFunction().toString());
    }

    @api
    testFunctions() {
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', getWindow().toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', getDocument().toString());
        testUtil.assertEquals('SecureObject: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', getElement().toString());
        this.testObject(getObject());

        let getWin = getWindowFunction();
        let getDoc = getDocumentFunction();
        let getEl = getElementFunction();
        let getObj = getObjectFunction();
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', getWin().toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', getDoc().toString());
        testUtil.assertEquals('SecureObject: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', getEl().toString());
        this.testObject(getObj());

        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', getWindowReturn(window).toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', getDocumentReturn(document).toString());
        testUtil.assertEquals('SecureObject: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', getElementReturn(document.createElement('DIV')).toString());
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', getWindowReturnFunction(function() { return window; }).toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', getDocumentReturnFunction(function() { return document; }).toString());
        testUtil.assertEquals('SecureObject: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', getElementReturnFunction(function() { return document.createElement('DIV'); }).toString());
    }
}
