import { LightningElement, api } from 'lwc';
import * as testUtil from 'securemoduletest-test-util';
import defaultFunction, {
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
} from 'securemoduletest-module-in-same-namespace-non-lockerized-exports';

export default class ImportLockerizedFromSameNamespaceExportLockerized extends LightningElement {
    @api NAME = 'ImportLockerizedFromSameNamespaceExportLockerized { NS: "securemoduletest" }';
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
        testUtil.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', ELEMENT.toString());
        this.testObject(OBJECT);
    }

    testObject(obj) {
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', obj.win.toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', obj.doc.toString());
        testUtil.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', obj.el.toString());
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', obj.winFunction().toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', obj.docFunction().toString());
        testUtil.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', obj.elFunction().toString());
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', obj.winThisContext.toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', obj.docThisContext.toString());
        testUtil.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', obj.elThisContext.toString());
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', obj.winThisContextFunction().toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', obj.docThisContextFunction().toString());
        testUtil.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', obj.elThisContextFunction().toString());
    }

    @api
    testFunctions() {
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', getWindow().toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', getDocument().toString());
        testUtil.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', getElement().toString());
        this.testObject(getObject());

        let getWin = getWindowFunction();
        let getDoc = getDocumentFunction();
        let getEl = getElementFunction();
        let getObj = getObjectFunction();
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', getWin().toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', getDoc().toString());
        testUtil.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', getEl().toString());
        this.testObject(getObj());

        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', getWindowReturn(window).toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', getDocumentReturn(document).toString());
        testUtil.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', getElementReturn(document.createElement('DIV')).toString());
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', getWindowReturnFunction(window).toString());
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', getDocumentReturnFunction(document).toString());
        testUtil.assertEquals('SecureElement: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', getElementReturnFunction(document.createElement('DIV')).toString());
    }

    @api
    testDefault() {
        let iterator = defaultFunction();

        let firstYield = iterator.next();
        testUtil.assertEquals({ value: window, done: false }, firstYield);
        testUtil.assertEquals('SecureWindow: [object Window]{ key: {"namespace":"secureModuleTest"} }', firstYield.value.toString());

        let secondYield = iterator.next();
        testUtil.assertEquals({ value: document, done: false }, secondYield);
        testUtil.assertEquals('SecureDocument: [object HTMLDocument]{ key: {"namespace":"secureModuleTest"} }', secondYield.value.toString());

        let thirdYield = iterator.next();
        testUtil.assertEquals({ value: document.createElement('DIV'), done: false }, thirdYield);
        testUtil.assertEquals('SecureObject: [object HTMLDivElement]{ key: {"namespace":"secureModuleTest"} }', thirdYield.value.toString());

        let finalReturn = iterator.next();
        testUtil.assertEquals({ value: 'Default!', done: true }, finalReturn);
    }
}
