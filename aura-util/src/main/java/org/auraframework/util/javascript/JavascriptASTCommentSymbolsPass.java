/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.auraframework.util.javascript;

import com.google.javascript.jscomp.AbstractCompiler;
import com.google.javascript.jscomp.CompilerPass;
import com.google.javascript.jscomp.NodeTraversal;
import com.google.javascript.jscomp.NodeTraversal.AbstractPostOrderCallback;
import com.google.javascript.rhino.IR;
import com.google.javascript.rhino.Node;


public class JavascriptASTCommentSymbolsPass implements CompilerPass {
	private final AbstractCompiler compiler;
	
	JavascriptASTCommentSymbolsPass(AbstractCompiler compiler) {
		this.compiler = compiler;
	}
	@Override
	public void process(Node externs, Node root) {
		NodeTraversal.traverse(compiler, root, new FindRegExp());
	}
	
	/**
	 * Traverses the AST looking for uses of == or !=. Upon finding one, it will
	 * * report an error unless {@code @suppress double-equals}} is present.
	 */
	private class FindRegExp extends AbstractPostOrderCallback {
		private final String REGEX_TARGET = "*";
		private final String REGEX_REPLACE = "{0,}";
		
		private final String CLOSE_COMMENT = "*/";
		private final String CLOSE_COMMENT_PATTERN = "#_@_#";
		private final String CLOSE_COMMENT_REPLACE = "*" + CLOSE_COMMENT_PATTERN + "/";
		private final String CLOSE_COMMENT_REGEXP = "\\*" + CLOSE_COMMENT_PATTERN;
		
		
		@Override
		public void visit(NodeTraversal t, Node n, Node parent) {
			
			// Replace regular expression symbol `*` with the equivalent {0,}
			if (n.isRegExp()) {
				Node regexStringNode = n.getFirstChild();
				String regex = regexStringNode.getString().replace(REGEX_TARGET, REGEX_REPLACE);
				regexStringNode.setString(regex);
			}
			
			// If we found */ within a string, we need to do some crazy refactor s
			if (n.isString() && n.getString().contains(CLOSE_COMMENT)) {
				String insideCommentString = n.getString();
				insideCommentString = insideCommentString.replace(CLOSE_COMMENT, CLOSE_COMMENT_REPLACE);
				
				// String: "*/" is transformed into: "*#_@_#/".replace(/\*#_@_#/g, "*")
				Node newChild = IR.call(
									IR.getprop(
											IR.string(insideCommentString), 
											IR.string("replace")
									),
									IR.regexp(IR.string(CLOSE_COMMENT_REGEXP), IR.string("g")),
									IR.string("*")
								);
				
				parent.replaceChild(n, newChild);
			}
		}
	}
}
