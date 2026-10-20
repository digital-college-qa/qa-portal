import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
let parse;
try{({parse}=require('acorn'));}catch(error){if(!process.env.QA_DEPENDENCIES)throw error;({parse}=require(process.env.QA_DEPENDENCIES+'/acorn'));}
export const methods={
  page:new Set(['goto','getByRole','getByText','getByTestId','getByLabel','getByPlaceholder','locator','title','url']),
  locator:new Set(['getByRole','getByText','getByTestId','getByLabel','getByPlaceholder','locator','filter','nth','first','last','click','fill','check','uncheck','selectOption','press','count','innerText','textContent','getAttribute','isVisible','isEnabled']),
  request:new Set(['get','post','put','patch','delete']),
  response:new Set(['status','ok','json','text']),
  expect:new Set(['toBe','toEqual','toContain','toBeGreaterThan','toBeLessThan','toBeTruthy','toBeFalsy','toBeVisible','toBeHidden','toBeEnabled','toBeDisabled','toHaveText','toContainText','toHaveCount','toHaveValue','toHaveURL','toHaveTitle'])
};
const forbidden=new Set(['__proto__','prototype','constructor','process','globalThis','window','document','require','eval','Function','fetch','import','Buffer']);
export function compile(code){
  if(typeof code!=='string'||code.length>8000)throw Error('The test must contain at most 8000 characters');
  const ast=parse(code,{ecmaVersion:'latest',sourceType:'module'}),tests=[];
  let count=0;
  function walk(node,parent){
    if(!node||typeof node!=='object')return;
    if(++count>1200)throw Error('Test is too large');
    const allowed=new Set(['Program','ImportDeclaration','ImportSpecifier','Identifier','Literal','ExpressionStatement','CallExpression','ArrowFunctionExpression','ObjectPattern','Property','BlockStatement','AwaitExpression','MemberExpression','VariableDeclaration','VariableDeclarator','ObjectExpression','ArrayExpression','UnaryExpression','BinaryExpression']);
    if(!allowed.has(node.type))throw Error('Unsupported syntax: '+node.type+'. Use the simple Playwright examples.');
    if(node.type==='Identifier'&&forbidden.has(node.name))throw Error('This identifier is not available in the teaching runner');
    if(node.type==='MemberExpression'&&(node.computed||node.optional))throw Error('Use named supported methods, not computed properties');
    if(node.type==='Property'&&(node.computed||node.method||node.kind!=='init'||forbidden.has(node.key.name||node.key.value)))throw Error('Unsupported object property');
    if(node.type==='Literal'&&typeof node.value==='string'&&node.value.length>4000)throw Error('String is too long');
    if(node.regex&&node.regex.pattern.length>100)throw Error('Regular expression is too long');
    if(node.type==='CallExpression'&&node.optional)throw Error('Optional calls are not supported');
    if(node.type==='VariableDeclaration'&&node.kind!=='const')throw Error('Use const for local values');
    if(node.type==='ArrowFunctionExpression'&&parent?.type!=='CallExpression')throw Error('Functions can only be test bodies');
    for(const [key,value]of Object.entries(node)){if(['start','end','raw','regex','value','loc'].includes(key))continue;if(Array.isArray(value))value.forEach(v=>walk(v,node));else if(value&&typeof value==='object')walk(value,node);}
  }
  walk(ast);
  for(const statement of ast.body){
    if(statement.type==='ImportDeclaration'){
      if(statement.source.value!=='@playwright/test'||statement.specifiers.some(s=>!['test','expect'].includes(s.imported?.name)||s.local.name!==s.imported.name))throw Error("Only import { test, expect } from '@playwright/test' is supported");
      continue;
    }
    const call=statement.expression;
    if(statement.type!=='ExpressionStatement'||call?.type!=='CallExpression'||call.callee.type!=='Identifier'||call.callee.name!=='test')throw Error('Only test(...) declarations are allowed at the top level');
    const [title,fn]=call.arguments;
    if(call.arguments.length!==2||title?.type!=='Literal'||typeof title.value!=='string'||title.value.length>150||fn?.type!=='ArrowFunctionExpression'||!fn.async||fn.body.type!=='BlockStatement')throw Error('Use test(title, async ({ page }) => { ... })');
    if(fn.params.length!==1||fn.params[0].type!=='ObjectPattern'||fn.params[0].properties.some(p=>!['page','request'].includes(p.key.name)||p.value.name!==p.key.name))throw Error('Available fixtures: page, request');
    if(fn.body.body.length>35)throw Error('Use at most 35 statements per test');
    tests.push({title:title.value,body:fn.body.body});
  }
  if(tests.length<1||tests.length>3)throw Error('Submit 1-3 simple tests per run');
  return tests;
}
export function reference(kind,value){return {__qaRef:true,kind,value};}
const unwrap=value=>value?.__qaRef?value.value:value;
export async function executeStatements(statements,{page,request,expect,baseURL,step}){
  const env=new Map([['page',reference('page',page)],['request',reference('request',request)]]);let operations=0;
  async function expression(node){
    if(++operations>300)throw Error('Operation limit exceeded');
    if(node.type==='AwaitExpression')return expression(node.argument);
    if(node.type==='Literal')return node.regex?new RegExp(node.regex.pattern,node.regex.flags):node.value;
    if(node.type==='Identifier'){if(!env.has(node.name))throw Error('Unknown variable: '+node.name);return env.get(node.name);}
    if(node.type==='ObjectExpression'){const object=Object.create(null);for(const p of node.properties)object[p.key.name??p.key.value]=await expression(p.value);return object;}
    if(node.type==='ArrayExpression'){const values=[];for(const item of node.elements)values.push(await expression(item));return values;}
    if(node.type==='UnaryExpression'){const value=unwrap(await expression(node.argument));if(node.operator==='!')return !value;if(node.operator==='-')return -value;if(node.operator==='typeof')return typeof value;throw Error('Unsupported operator');}
    if(node.type==='BinaryExpression'){
      const left=unwrap(await expression(node.left)),right=unwrap(await expression(node.right));
      switch(node.operator){case'===':return left===right;case'!==':return left!==right;case'>':return left>right;case'<':return left<right;case'+':return left+right;case'-':return left-right;default:throw Error('Unsupported operator');}
    }
    if(node.type==='MemberExpression'){
      const object=await expression(node.object),key=node.property.name;
      if(object?.__qaRef){if(object.kind==='expect'&&key==='not')return reference('expect',object.value.not);throw Error('Use a supported method call');}
      if(object===null||object===undefined)throw Error('Cannot read '+key+' of '+object);
      if(forbidden.has(key))throw Error('Property is not available');
      if(key==='length'&&(Array.isArray(object)||typeof object==='string'))return object.length;
      if(Object.hasOwn(object,key))return object[key];return undefined;
    }
    if(node.type==='CallExpression'){
      const args=[];for(const arg of node.arguments)args.push(await expression(arg));
      if(node.callee.type==='Identifier'){
        if(node.callee.name==='expect'&&args.length===1)return reference('expect',expect(unwrap(args[0])));
        throw Error('Only expect() and supported Playwright calls are available');
      }
      if(node.callee.type!=='MemberExpression')throw Error('Unsupported call');
      if(node.callee.object.type==='Identifier'&&node.callee.object.name==='Array'&&node.callee.property.name==='isArray')return Array.isArray(unwrap(args[0]));
      const object=await expression(node.callee.object),method=node.callee.property.name;
      if(!object?.__qaRef||!methods[object.kind]?.has(method))throw Error('Unsupported command: '+method);
      if(object.kind==='page'&&method==='goto'){
        if(typeof args[0]!=='string')throw Error('goto expects a shop path');
        const url=new URL(args[0].replace(/^\//,''),baseURL);
        if(!url.href.startsWith(baseURL)||!/^\/(?:shop\/)?(?:home|menu|product|cart|checkout|login|register|account|contacts)\.html$/.test(url.pathname))throw Error('Tests may only open the training shop');
        await object.value.goto(url.href,{timeout:8000});return null;
      }
      if(['page','locator'].includes(object.kind)&&['getByRole','getByText','getByTestId','getByLabel','getByPlaceholder','locator','filter','nth','first','last'].includes(method))return reference('locator',object.value[method](...args.map(unwrap)));
      if(object.kind==='request')return reference('response',await object.value[method](...args.map(unwrap)));
      if(object.kind==='response')return object.value[method](...args.map(unwrap));
      if(object.kind==='locator'&&['click','fill','check','uncheck','selectOption','press'].includes(method)){await object.value[method](...args.map(unwrap));return null;}
      if(object.kind==='expect'){await object.value[method](...args.map(unwrap));return null;}
      return object.value[method](...args.map(unwrap));
    }
    throw Error('Unsupported expression: '+node.type);
  }
  for(const statement of statements){
    const start=Date.now();
    try{
      if(statement.type==='VariableDeclaration'){
        for(const declaration of statement.declarations){if(declaration.id.type!=='Identifier'||!declaration.init||env.has(declaration.id.name))throw Error('Use a new const variable with a value');env.set(declaration.id.name,await expression(declaration.init));}
      }else if(statement.type==='ExpressionStatement')await expression(statement.expression);else throw Error('Only const and actions/assertions are supported');
      await step(statement,'passed',Date.now()-start);
    }catch(error){await step(statement,'failed',Date.now()-start,error.message);throw error;}
  }
}
