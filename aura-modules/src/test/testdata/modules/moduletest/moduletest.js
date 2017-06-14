export default class Test {
    @api stringQuote = 'str"ing';
    @api stringDoubleQuote = "str'ing";
    @api stringBacktick = `key=${value}`;
    
    @api VALID_NAME_RE = /^([a-zA-Z]\w*):([a-zA-Z]\w*)$/;
}