(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{1700:function(module,exports){module.exports=function(hljs){var builtInTypeMode={className:"built_in",begin:"\\b(void|bool|int|int8|int16|int32|int64|uint|uint8|uint16|uint32|uint64|string|ref|array|double|float|auto|dictionary)"},objectHandleMode={className:"symbol",begin:"[a-zA-Z0-9_]+@"},genericMode={className:"keyword",begin:"<",end:">",contains:[builtInTypeMode,objectHandleMode]};return builtInTypeMode.contains=[genericMode],objectHandleMode.contains=[genericMode],{aliases:["asc"],keywords:"for in|0 break continue while do|0 return if else case switch namespace is cast or and xor not get|0 in inout|10 out override set|0 private public const default|0 final shared external mixin|10 enum typedef funcdef this super import from interface abstract|0 try catch protected explicit",illegal:"(^using\\s+[A-Za-z0-9_\\.]+;$|\\bfunctions*[^\\(])",contains:[{className:"string",begin:"'",end:"'",illegal:"\\n",contains:[hljs.BACKSLASH_ESCAPE],relevance:0},{className:"string",begin:'"',end:'"',illegal:"\\n",contains:[hljs.BACKSLASH_ESCAPE],relevance:0},{className:"string",begin:'"""',end:'"""'},hljs.C_LINE_COMMENT_MODE,hljs.C_BLOCK_COMMENT_MODE,{beginKeywords:"interface namespace",end:"{",illegal:"[;.\\-]",contains:[{className:"symbol",begin:"[a-zA-Z0-9_]+"}]},{beginKeywords:"class",end:"{",illegal:"[;.\\-]",contains:[{className:"symbol",begin:"[a-zA-Z0-9_]+",contains:[{begin:"[:,]\\s*",contains:[{className:"symbol",begin:"[a-zA-Z0-9_]+"}]}]}]},builtInTypeMode,objectHandleMode,{className:"literal",begin:"\\b(null|true|false)"},{className:"number",begin:"(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?f?|\\.\\d+f?)([eE][-+]?\\d+f?)?)"}]}}}}]);
//# sourceMappingURL=react-syntax-highlighter_languages_highlight_angelscript.98671cca2a90e9e242e2.bundle.js.map