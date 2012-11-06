/*
 * Copyright (C) 2012 salesforce.com, inc.
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
 
/*
 * the grammar for auras expression engine
 */

grammar Expression;

@lexer::header {
/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl.expression.parser;

import org.auraframework.impl.expression.AuraLexerException;
}

@lexer::members {
    @Override
    public void reportError(RecognitionException e) {
        throw new AuraLexerException(e);
    }
}

@parser::header {
/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl.expression.parser;

import org.auraframework.expression.Expression;
import org.auraframework.impl.expression.ExpressionFactory;
import org.auraframework.impl.expression.functions.Function;

import org.auraframework.impl.expression.functions.BooleanFunctions;
import static org.auraframework.impl.expression.functions.MathFunctions.*;
import static org.auraframework.impl.expression.functions.MultiFunctions.*;

import java.util.LinkedList;

}

@parser::members {
    private ExpressionFactory factory;

    public void setExpressionFactory(ExpressionFactory f) {
        this.factory = f;
    }

    @Override
    protected Object recoverFromMismatchedToken(IntStream input, int ttype, BitSet follow) throws RecognitionException {
        throw new MismatchedTokenException(ttype, input);
    }

    @Override
    public Object recoverFromMismatchedSet(IntStream input, RecognitionException e, BitSet follow) throws RecognitionException {
        throw e;
    }

    public int line(Token t) {
        return t.getLine();
    }

    public int column(Token t) {
        return t.getCharPositionInLine() + 1;
    }

    public static final String[] FRIENDLY_NAMES = new String[tokenNames.length];
    static {
        FRIENDLY_NAMES[QUESTION] = "a question mark";
        FRIENDLY_NAMES[COLON] = "a colon";
        FRIENDLY_NAMES[OR] = "a double pipe";
        FRIENDLY_NAMES[AND] = "a field or entity name";
        FRIENDLY_NAMES[EQ] = "an equals sign";
        FRIENDLY_NAMES[NEQ] = "an equals sign";
        FRIENDLY_NAMES[LT] = "a left angle bracket";
        FRIENDLY_NAMES[GT] = "a right angle bracket";
        FRIENDLY_NAMES[LE] = "an exclamation point";
        FRIENDLY_NAMES[GE] = "a map literal assignment";
        FRIENDLY_NAMES[MINUS]= "a question mark";
        FRIENDLY_NAMES[PLUS] = "a plus";
        FRIENDLY_NAMES[STAR] = "a multiplication";
        FRIENDLY_NAMES[SLASH] = "a division";
        FRIENDLY_NAMES[PERCENT] = "a modulus";
        FRIENDLY_NAMES[NOT] = "an exclamation point";
        FRIENDLY_NAMES[LPAREN] = "a left parenthesis";
        FRIENDLY_NAMES[RPAREN] = "a right parenthesis";
        FRIENDLY_NAMES[DOT] = "a period";
        FRIENDLY_NAMES[ID] = "an identifier";
        FRIENDLY_NAMES[LBRAK] = "a left square bracket";
        FRIENDLY_NAMES[INT] = "a positive integer";
        FRIENDLY_NAMES[RBRAK] = "a right square bracket";
        FRIENDLY_NAMES[FLOAT] = "a floating point number";
        FRIENDLY_NAMES[BOOL] = "either true or false";
        FRIENDLY_NAMES[NULL] = "null";
        FRIENDLY_NAMES[STRING] = "a single quoted string";
        FRIENDLY_NAMES[COMMA] = "a comma";
        FRIENDLY_NAMES[EXPONENT] = "an exponent";
        FRIENDLY_NAMES[WS] = "whitespace";
        FRIENDLY_NAMES[ESC_SEQ] = "an escape sequence";
        FRIENDLY_NAMES[HEX_DIGIT] = "a hexadecimal number";
        FRIENDLY_NAMES[UNICODE_ESC] = "a unicode character";
    }
}

@rulecatch {
    catch (RecognitionException re) {
        throw re;
    }
}

// here be the start rule matey.
expression returns [Expression expr]
    :   e=ternaryExpr { $expr = e; } EOF
    ;

// lowest precedence operator
ternaryExpr returns [Expression ret]
    :   e=orExpr { $ret = e; }
        (QUESTION t=ternaryExpr COLON f=ternaryExpr { $ret = factory.createTernaryFunction($ret, t, f); })?
    ;

orExpr returns [Expression ret]
    :   e=andExpr { $ret = e; } (OR e=andExpr { $ret = factory.createFunction(BooleanFunctions.OR, $ret, e); })*
    ;

andExpr returns [Expression ret]
    :   e=comparisonExpr { $ret = e; } (AND e=comparisonExpr { $ret = factory.createFunction(BooleanFunctions.AND, $ret, e); })*
    ;

comparisonExpr returns [Expression ret]
    :   e=addSubExpr { $ret = e; }
        (fn=comparisonOp val=addSubExpr { $ret = factory.createFunction(fn, e, val); })?
    ;

comparisonOp returns [Function fn]
    :   EQ { $fn = EQUALS; }
    |   NEQ { $fn = NOTEQUALS; }
    |   LT { $fn = LESS_THAN; }
    |   GT { $fn = GREATER_THAN; }
    |   LE { $fn = LESS_THAN_OR_EQUAL; }
    |   GE { $fn = GREATER_THAN_OR_EQUAL; }
    ;

addSubExpr returns [Expression ret]
    :   e=multDivExpr { $ret = e; }
            // needs to be disambiguated from unary minus
            ((MINUS) => MINUS e=multDivExpr { $ret =factory.createFunction(SUBTRACT, $ret, e);}
            | PLUS e=multDivExpr { $ret = factory.createFunction(ADD, $ret, e);})*
    ;

multDivExpr returns [Expression ret]
    :   e=unaryExpr { $ret = e; }
        (STAR e=unaryExpr { $ret = factory.createFunction(MULTIPLY, $ret, e);} |
         SLASH e=unaryExpr { $ret = factory.createFunction(DIVIDE, $ret, e);} |
         PERCENT e=unaryExpr { $ret = factory.createFunction(MODULUS, $ret, e);})*
    ;

unaryExpr returns [Expression ret]
    :   MINUS e=unaryExpr { $ret = factory.createFunction(NEGATE, e); }
    |   NOT e=unaryExpr { $ret = factory.createFunction(BooleanFunctions.NOT, e); }
    |   LPAREN e=ternaryExpr RPAREN { $ret = e; }
    |   e=value { $ret = e; }
    ;

value returns [Expression expr]
    :   p=valuePath { $expr = factory.createPropertyReference(p); }
    |   l=literal { $expr = l; }
    |   f=functionExpr { $expr = f; }
    ;

valuePath returns [List<String> path]
@init{
    path = new LinkedList<String>();
}
    : maybeArray[path] (DOT maybeArray[path])*
    ;
    
maybeArray [List<String> path]
    : ID { path.add($ID.getText()); }(LBRAK INT RBRAK  { path.add($INT.getText()); })*
    ;

literal returns [Expression expr]
    : INT { $expr = this.factory.createNumber($INT.text); }
      | FLOAT { $expr = factory.createNumber($FLOAT.text); }
      | BOOL { $expr = factory.createBool($BOOL.text); }
      | NULL { $expr = factory.createNull(); }
      | STRING { $expr = factory.createString($STRING.text); }
    ;

functionExpr returns [Expression ret]
@init{
    List<Expression> args = new ArrayList<Expression>();
}
    :   ID LPAREN (e=ternaryExpr { args.add(e); } (COMMA e2=ternaryExpr { args.add(e2); })*)? RPAREN {  $ret = factory.createFunction($ID.text, args); }
    ;

BOOL : 'true' | 'false';

NULL : 'null';

INT : '0'..'9'+
    ;

FLOAT
    :   ('0'..'9')+ '.' ('0'..'9')* EXPONENT?
    |   '.' ('0'..'9')+ EXPONENT?
    |   ('0'..'9')+ EXPONENT
    ;

WS  :   ( ' '
        | '\t'
        | '\r'
        | '\n'
        ) { skip(); }
    ;

STRING :  '\'' ( ESC_SEQ | ~('\\'|'\'') )* '\'';

LPAREN : '(' ;

RPAREN : ')';

LBRAK : '[' ;

RBRAK : ']';

COMMA : ',';

OR : '||' ;

AND : '&&' ;

NOT :  '!' ;

EQ : '==' | 'eq' ;
 
NEQ : '!=' | 'ne' ;

LT : '<' | 'lt';

GT : '>' | 'gt' ;

GE : '>=' | 'ge' ;

LE : '<=' | 'le' ;

MINUS : '-';

PLUS : '+' ;

STAR : '*' ;

SLASH : '/' ;

PERCENT : '%';

DOT : '.';

QUESTION : '?';

COLON : ':';

ID  : ('a'..'z'|'$'|'_') ('a'..'z'|'0'..'9'|'_')* ;

fragment
EXPONENT : 'e' ('+'|'-')? ('0'..'9')+ ;

fragment
HEX_DIGIT : ('0'..'9'|'a'..'f') ;

fragment
ESC_SEQ
    :   '\\' ('b'|'t'|'n'|'f'|'r'|'\"'|'\''|'\\')
    |   UNICODE_ESC
    ;

fragment
UNICODE_ESC : '\\' 'u' HEX_DIGIT HEX_DIGIT HEX_DIGIT HEX_DIGIT;
