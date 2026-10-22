const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/shop-requirements.js'),'utf8'),context);
test('requirements specify exact drink volumes instead of one universal M volume',()=>{
  const rules=Object.fromEntries(context.window.QARequirements.rules('1.0').map(([id,ru,kz])=>[id,{ru,kz}]));
  assert.match(rules['CAT-01'].ru,/объём.*мл/);
  for(const lang of ['ru','kz']){
    assert.match(rules['CAT-02'][lang],/Эспрессо — 60 мл/);
    assert.match(rules['CAT-02'][lang],/Американо — 250 мл/);
    assert.match(rules['CAT-02'][lang],/Капучино — 350 мл/);
  }
  assert.doesNotMatch(rules['CAT-02'].ru,/одного объёма M/);
  const sizes=context.window.QARequirements.rules('1.5').find(([id])=>id==='PRD-02')[1];
  assert.match(sizes,/S 30 мл, M 60 мл, L 90 мл/);
  assert.match(sizes,/S 150 мл, M 250 мл, L 350 мл/);
});
