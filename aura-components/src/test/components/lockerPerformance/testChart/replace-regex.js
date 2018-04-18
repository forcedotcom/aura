#!/usr/bin/env node

const uglify = require("uglify-js");
const fs = require("fs");

function replace_RegExp(code) {
  const ast = uglify.parse(code);

  var nodes = [];
  ast.walk(
    new uglify.TreeWalker(function(node) {
      if (node instanceof uglify.AST_RegExp) {
        nodes.push(node);
      }
    })
  );

  while (nodes.length) {
    const node = nodes.pop();

    const start_pos = node.start.pos;
    const end_pos = node.end.endpos;

    const source = node.value.source;
    const flags = node.value.flags;

    const replacement = new uglify.AST_New({
      expression: new uglify.AST_SymbolRef({ name: "RegExp" }),
      args: [
        new uglify.AST_String({ value: source }),
        new uglify.AST_String({ value: flags })
      ]
    }).print_to_string({ beautify: true });

    // console.log(replacement);
    code = splice_string(code, start_pos, end_pos, replacement);
  }

  return code;
}

function splice_string(str, begin, end, replacement) {
  return str.substr(0, begin) + replacement + str.substr(end);
}

const inputfilename = process.argv[2];
const outputfilename = process.argv[3];

console.log("Reading", inputfilename);

const input = fs.readFileSync(inputfilename, "utf8");
// const input = "new RegExp('^[\\s\\uFEFF\\xA0]+|[\\s\\uFEFF\\xA0]+$', 'g')";
// const input = "/^[\\s\\uFEFF\\xA0]+|[\\s\\uFEFF\\xA0]+$/g";

console.log("Processing...");
const output = replace_RegExp(input);

console.log("Writing", outputfilename);
fs.writeFileSync(outputfilename, output, "utf8");
