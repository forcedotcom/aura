import { LightningElement, api } from "lwc";

export default class Test extends LightningElement {
    @api stringQuote = 'str"ing';
    @api stringDoubleQuote = "str'ing";
    @api stringBacktick = `key=${"test tick"}`;
    @api VALID_NAME_RE = /^([a-zA-Z]\w*):([a-zA-Z]\w*)$/;
}