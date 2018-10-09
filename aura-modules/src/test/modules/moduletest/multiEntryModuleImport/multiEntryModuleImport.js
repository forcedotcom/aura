import { LightningElement } from "lwc";
import { test } from "moduletest/multiEntryExport";

export default class Foo extends LightningElement {
    foo = test;
}
