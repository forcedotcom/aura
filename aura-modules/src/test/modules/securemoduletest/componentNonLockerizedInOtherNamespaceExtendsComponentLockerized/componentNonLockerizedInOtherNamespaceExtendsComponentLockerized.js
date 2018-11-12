import { api } from 'lwc';
import ComponentLockerizedExtends from 'secureothernamespace/componentLockerizedExtends';
import * as testUtil from 'securemoduletest/testUtil';

export default class ComponentNonLockerizedInOtherNamespaceExtendsComponentNonLockerized extends ComponentLockerizedExtends {
    @api COMPONENT = 'ComponentNonLockerizedInOtherNamespaceExtendsComponentNonLockerized { NS: "securemoduletest" }';
    @api NAME = 'Non-Lockerized! [ChildClass]';

    @api BOOLEAN_OVERRIDE = false;
    @api NULL_OVERRIDE = null;
    @api UNDEFINED_OVERRIDE = undefined;
    @api NUMBER_OVERRIDE = 999;
    @api STRING_OVERRIDE = 'Override!';
    @api SYMBOL_OVERRIDE = Symbol('XYZ');

    getWindowOverride() {
        return window;
    }
    getDocumentOverride() {
        return document;
    }
    getElementOverride() {
        return document.createElement('DIV');
    }

    @api
    testPrimitives() {
        testUtil.assertEquals(false, this.BOOLEAN);
        testUtil.assertEquals(null, this.NULL);
        testUtil.assertEquals(undefined, this.UNDEFINED);
        testUtil.assertEquals(100, this.NUMBER);
        testUtil.assertEquals('Hello!', this.STRING);
        testUtil.assertEquals('Symbol(ABC)', this.SYMBOL.toString());

        testUtil.assertEquals(false, this.BOOLEAN_OVERRIDE);
        testUtil.assertEquals(null, this.NULL_OVERRIDE);
        testUtil.assertEquals(undefined, this.UNDEFINED_OVERRIDE);
        testUtil.assertEquals(999, this.NUMBER_OVERRIDE);
        testUtil.assertEquals('Override!', this.STRING_OVERRIDE);
        testUtil.assertEquals('Symbol(XYZ)', this.SYMBOL_OVERRIDE.toString());

        this.testBaseComponentPrimitives();
    }

    @api
    testObjects() {
        testUtil.assertEquals('[object Window]', this.WINDOW.toString(), 'Property "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.DOCUMENT.toString(), 'Property "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.ELEMENT.toString(), 'Property "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.OBJECT.win.toString(), 'Object "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.OBJECT.doc.toString(), 'Object "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.OBJECT.el.toString(), 'Object "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.OBJECT.winFunction().toString(), 'Object function "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.OBJECT.docFunction().toString(), 'Object function "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.OBJECT.elFunction().toString(), 'Object function "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.OBJECT.winThisContextFunction().toString(), 'Object this context "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.OBJECT.docThisContextFunction().toString(), 'Object this context "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.OBJECT.elThisContextFunction().toString(), 'Object this context "element" lockerized! [ChildClass]');

        this.testBaseComponentObjects();
    }

    @api
    testFunctions() {
        testUtil.assertEquals('[object Window]', this.getWindow().toString(), 'Function "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocument().toString(), 'Function "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.getElement().toString(), 'Function "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.getWindowOverride().toString(), 'Function override "window" lockerized!');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocumentOverride().toString(), 'Function override "document" lockerized!');
        testUtil.assertEquals('[object HTMLDivElement]',this.getElementOverride().toString(), 'Function override "element" lockerized!');

        testUtil.assertEquals('[object Window]', this.getWindowThisContext().toString(), 'Function this context "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocumentThisContext().toString(), 'Function this context "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]',this.getElementThisContext().toString(), 'Function this context "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.getWindowReturn(window).toString(), 'Function return "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocumentReturn(document).toString(), 'Function return "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.getElementReturn(document.createElement('DIV')).toString(), 'Function return "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.getWindowReturnFunction(function() { return window; }).toString(), 'Function return function "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocumentReturnFunction(function() { return document; }).toString(), 'Function return function "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.getElementReturnFunction(function() { return document.createElement('DIV'); }).toString(), 'Function return function "element" lockerized! [ChildClass]');

        this.testBaseComponentFunctions();
    }

    @api
    testCreatedPrimitives() {
        super.BOOLEAN_SUPER = false;
        super.NULL_SUPER = null;
        super.UNDEFINED_SUPER = undefined;
        super.NUMBER_SUPER = 200;
        super.STRING_SUPER = "Super!";
        super.SYMBOL_SUPER = Symbol('QWERTY');

        testUtil.assertEquals(false, this.BOOLEAN_SUPER);
        testUtil.assertEquals(null, this.NULL_SUPER);
        testUtil.assertEquals(undefined, this.UNDEFINED_SUPER);
        testUtil.assertEquals(200, this.NUMBER_SUPER);
        testUtil.assertEquals('Super!', this.STRING_SUPER);
        testUtil.assertEquals('Symbol(QWERTY)', this.SYMBOL_SUPER.toString());

        this.testBaseComponentCreatedPrimitives();
    }

    @api
    testCreatedObjects() {
        super.winSuper = window;
        super.docSuper = document;
        super.elSuper = document.createElement('DIV');

        super.objSuper = {
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

        testUtil.assertEquals('[object Window]', this.winSuper.toString(), '[Super] Property "window" lockerized!');
        testUtil.assertEquals('[object HTMLDocument]', this.docSuper.toString(), '[Super] Property "document" lockerized!');
        testUtil.assertEquals('[object HTMLDivElement]', this.elSuper.toString(), '[Super] Property "element" lockerized!');

        testUtil.assertEquals('[object Window]', this.objSuper.win.toString(), '[Super] Object "window" lockerized!');
        testUtil.assertEquals('[object HTMLDocument]', this.objSuper.doc.toString(), '[Super] Object  "document" lockerized!');
        testUtil.assertEquals('[object HTMLDivElement]', this.objSuper.el.toString(), '[Super] Object "element" lockerized!');

        testUtil.assertEquals('[object Window]', this.objSuper.winFunction().toString(), '[Super] Object function "window" lockerized!');
        testUtil.assertEquals('[object HTMLDocument]', this.objSuper.docFunction().toString(), '[Super] Object function "document" lockerized!');
        testUtil.assertEquals('[object HTMLDivElement]', this.objSuper.elFunction().toString(), '[Super] Object function  "element" lockerized!');

        testUtil.assertEquals('[object Window]', this.objSuper.winThisContextFunction().toString(), '[Super] Object this context "window" lockerized!');
        testUtil.assertEquals('[object HTMLDocument]', this.objSuper.docThisContextFunction().toString(), '[Super] Object this context "document" lockerized!');
        testUtil.assertEquals('[object HTMLDivElement]', this.objSuper.elThisContextFunction().toString(), '[Super] Object this context "element" lockerized!');

        this.testBaseComponentCreatedObjects();
    }

    @api
    testCreatedFunctions() {
        super.getWinSuper = function() { return window; };
        super.getDocSuper = function() { return document; };
        super.getElSuper = function() { return document.createElement('DIV'); };
        super.getWinThisContextSuper = function() { return this.WINDOW; };
        super.getDocThisContextSuper = function() { return this.DOCUMENT; };
        super.getElThisContextSuper = function() { return this.ELEMENT; };
        super.getWinReturnSuper = function(win) { return win; };
        super.getDocReturnSuper = function(doc) { return doc; };
        super.getElReturnSuper = function(el) { return el; };
        super.getWinReturnFuncSuper = function(win) { return win(); };
        super.getDocReturnFuncSuper = function(doc) { return doc(); };
        super.getElReturnFuncSuper = function(el) { return el(); };

        testUtil.assertEquals('[object Window]', this.getWinSuper().toString(), '[Super] Function "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocSuper().toString(), '[Super] Function "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.getElSuper().toString(), '[Super] Function "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.getWinThisContextSuper().toString(), '[Super] Function this context "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocThisContextSuper().toString(), '[Super] Function this context "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]',this.getElThisContextSuper().toString(), '[Super] Function this context "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.getWinReturnSuper(window).toString(), '[Super] Function return "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocReturnSuper(document).toString(), '[Super] Function return "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.getElReturnSuper(document.createElement('DIV')).toString(), '[Super] Function return "element" lockerized! [ChildClass]');

        testUtil.assertEquals('[object Window]', this.getWinReturnFuncSuper(function() { return window; }).toString(), '[Super] Function return function "window" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDocument]', this.getDocReturnFuncSuper(function() { return document; }).toString(), '[Super] Function return function "document" lockerized! [ChildClass]');
        testUtil.assertEquals('[object HTMLDivElement]', this.getElReturnFuncSuper(function() { return document.createElement('DIV'); }).toString(), '[Super] Function return function "element" lockerized! [ChildClass]');

        this.testBaseComponentCreatedFunctions();
    }
}
