'use strict'
const numeral = require('numeral')
const { calcAllZeta, calcUnitRelic, calcUnitRarity, calcUnitUlt } = require('./calculations')

module.exports = (unit = {}, gObj = [], eObj)=>{
  let len = 7
  let obj = {
    name: unit.nameKey+' ('+gObj.length,
    value: '```autohotkey\n'
  }
  if(eObj) obj.name += ' vs '+eObj.length;
  if(unit.combatType == 1){
    let gRelic = calcUnitRelic(gObj)
    if(eObj){
      let eRelic = calcUnitRelic(eObj)
      if(gRelic.total > 0 || eRelic.total > 0){
        obj.value += 'Reliced     : '+numeral(gRelic.total).format("0,0").padStart(len, ' ')+' vs '+numeral(eRelic.total).format("0,0")+'\n'
      }
      for(let i=11;i>0;i--){
        if ((gRelic[i] && gRelic[i] > 0) || (eRelic[i] && eRelic[i] > 0)) {
          obj.value += 'R'+i.toString()+'          : ' +numeral(gRelic[i] || 0).format("0,0").padStart(len, ' ') + ' vs ' + numeral(eRelic[i] || 0).format("0,0") + '\n'
        }
      }
    }else{
      if(gRelic.total > 0){
        obj.value += 'Reliced     : '+numeral(gRelic.total).format("0,0")+'\n'
      }
      for(let i=11;i>4;i--){
        if (gRelic[i]) {
          obj.value += 'R'+i.toString()+'          : ' + numeral(gRelic[i]).format("0,0") + '\n'
        }
      }
    }
    if(Object.values(unit.skills).filter(x=>x.zetaTier).length > 0){
      let gZetaCount = calcAllZeta(gObj, unit.skills)
      let eZetaCount
      if(eObj){
        eZetaCount = calcAllZeta(eObj, unit.skills)
        obj.value += 'All Zeta\'s  : '+numeral(gZetaCount.all).format('0,0').padStart(len, ' ')+' vs '+numeral(eZetaCount.all).format('0,0')+'\n'
        if(gZetaCount.some > 0 || eZetaCount.some > 0){
          obj.value += 'Some Zeta\'s : '+numeral(gZetaCount.some).format('0,0').padStart(len, ' ')+' vs '+numeral(eZetaCount.some).format('0,0')+'\n'
        }
      }else{
        obj.value += 'All Zeta\'s  : '+numeral(gZetaCount.all).format('0,0')+'\n'
        if(gZetaCount > 0){
          obj.value += 'Some Zeta\'s : '+numeral(gZetaCount.some).format('0,0')+'\n'
        }
      }
    }
    let ultCount = 0
    for (let i in unit.ultimate) {
     if (ultCount == 0) {
      obj.value += 'Ultimate    : '
      ultCount++
     }
     if (eObj) {
      obj.value +=numeral(calcUnitUlt(gObj, i)).format('0,0').padStart(len, ' ') + ' vs ' + numeral(calcUnitUlt(eObj, i)).format('0,0') + '\n'
     } else {
      obj.value += numeral(calcUnitUlt(gObj, i)).format('0,0') + '\n'
     }
    }
  }else{
   let gRarity = calcUnitRarity(gObj, 5)
  if(eObj){
    let eRarity = calcUnitRarity(eObj, 5)
    if(gRarity[7] > 0 || eRarity[7] > 0){
      obj.value += 'Seven Star   : '+numeral(gRarity[7]).format("0,0").padStart(len, ' ')+' vs '+numeral(eRarity[7]).format("0,0")+'\n'
    }
    if(gRarity[6] > 0 || eRarity[6] > 0){
      obj.value += 'Six Star     : '+numeral(gRarity[6]).format("0,0").padStart(len, ' ')+' vs '+numeral(eRarity[6]).format("0,0")+'\n'
    }
    if(gRarity[5] > 0 || eRarity[5] > 0){
      obj.value += 'Five Star    : '+numeral(gRarity[5]).format("0,0").padStart(len, ' ')+' vs '+numeral(eRarity[5]).format("0,0")+'\n'
    }
  }else{
    if(gRarity[7] > 0){
      obj.value += 'Seven Star   : '+numeral(gRarity[7]).format("0,0")+'\n'
    }
    if(gRarity[6] > 0){
      obj.value += 'Six   Star   : '+numeral(gRarity[6]).format("0,0")+'\n'
    }
    if(gRarity[5] > 0){
      obj.value += 'Five Star    : '+numeral(gRarity[5]).format("0,0")+'\n'
    }
  }

  }
  obj.value +="```"
  obj.name += ')'
  return obj
}
