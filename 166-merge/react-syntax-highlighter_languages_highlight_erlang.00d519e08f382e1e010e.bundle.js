(window.webpackJsonp=window.webpackJsonp||[]).push([[53],{1762:function(module,exports){module.exports=function(hljs){var BASIC_ATOM_RE="[a-z'][a-zA-Z0-9_']*",FUNCTION_NAME_RE="("+BASIC_ATOM_RE+":"+BASIC_ATOM_RE+"|"+BASIC_ATOM_RE+")",ERLANG_RESERVED={keyword:"after and andalso|10 band begin bnot bor bsl bzr bxor case catch cond div end fun if let not of orelse|10 query receive rem try when xor",literal:"false true"},COMMENT=hljs.COMMENT("%","$"),NUMBER={className:"number",begin:"\\b(\\d+#[a-fA-F0-9]+|\\d+(\\.\\d+)?([eE][-+]?\\d+)?)",relevance:0},NAMED_FUN={begin:"fun\\s+"+BASIC_ATOM_RE+"/\\d+"},FUNCTION_CALL={begin:FUNCTION_NAME_RE+"\\(",end:"\\)",returnBegin:!0,relevance:0,contains:[{begin:FUNCTION_NAME_RE,relevance:0},{begin:"\\(",end:"\\)",endsWithParent:!0,returnEnd:!0,relevance:0}]},TUPLE={begin:"{",end:"}",relevance:0},VAR1={begin:"\\b_([A-Z][A-Za-z0-9_]*)?",relevance:0},VAR2={begin:"[A-Z][a-zA-Z0-9_]*",relevance:0},RECORD_ACCESS={begin:"#"+hljs.UNDERSCORE_IDENT_RE,relevance:0,returnBegin:!0,contains:[{begin:"#"+hljs.UNDERSCORE_IDENT_RE,relevance:0},{begin:"{",end:"}",relevance:0}]},BLOCK_STATEMENTS={beginKeywords:"fun receive if try case",end:"end",keywords:ERLANG_RESERVED};BLOCK_STATEMENTS.contains=[COMMENT,NAMED_FUN,hljs.inherit(hljs.APOS_STRING_MODE,{className:""}),BLOCK_STATEMENTS,FUNCTION_CALL,hljs.QUOTE_STRING_MODE,NUMBER,TUPLE,VAR1,VAR2,RECORD_ACCESS];var BASIC_MODES=[COMMENT,NAMED_FUN,BLOCK_STATEMENTS,FUNCTION_CALL,hljs.QUOTE_STRING_MODE,NUMBER,TUPLE,VAR1,VAR2,RECORD_ACCESS];FUNCTION_CALL.contains[1].contains=BASIC_MODES,TUPLE.contains=BASIC_MODES,RECORD_ACCESS.contains[1].contains=BASIC_MODES;var PARAMS={className:"params",begin:"\\(",end:"\\)",contains:BASIC_MODES};return{aliases:["erl"],keywords:ERLANG_RESERVED,illegal:"(</|\\*=|\\+=|-=|/\\*|\\*/|\\(\\*|\\*\\))",contains:[{className:"function",begin:"^"+BASIC_ATOM_RE+"\\s*\\(",end:"->",returnBegin:!0,illegal:"\\(|#|//|/\\*|\\\\|:|;",contains:[PARAMS,hljs.inherit(hljs.TITLE_MODE,{begin:BASIC_ATOM_RE})],starts:{end:";|\\.",keywords:ERLANG_RESERVED,contains:BASIC_MODES}},COMMENT,{begin:"^-",end:"\\.",relevance:0,excludeEnd:!0,returnBegin:!0,lexemes:"-"+hljs.IDENT_RE,keywords:"-module -record -undef -export -ifdef -ifndef -author -copyright -doc -vsn -import -include -include_lib -compile -define -else -endif -file -behaviour -behavior -spec",contains:[PARAMS]},NUMBER,hljs.QUOTE_STRING_MODE,RECORD_ACCESS,VAR1,VAR2,TUPLE,{begin:/\.$/}]}}}}]);
//# sourceMappingURL=react-syntax-highlighter_languages_highlight_erlang.00d519e08f382e1e010e.bundle.js.map