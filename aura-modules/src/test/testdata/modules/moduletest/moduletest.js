import { Element, api } from "engine";

export default class Test extends Element {
    @api stringQuote = 'str"ing';
    @api stringDoubleQuote = "str'ing";
    @api stringBacktick = `key=${"test tick"}`;
    @api VALID_NAME_RE = /^([a-zA-Z]\w*):([a-zA-Z]\w*)$/;
}