'use strict'
const isOdd = (num)=>{
  return num % 2
}
const getBkCSS = (oddCount)=>{
  let bkCSS = 'memberOdd'
  if(isOdd(oddCount)) bkCSS = 'memberEven'
  oddCount++
  return bkCSS
}
module.exports = (pObj = {}, mods = [])=>{
  let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
  html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
  html += '<link href="/css/tbGP.css" rel="stylesheet">'
  html += '</head>'
  html += '<body>'
    html += '<table width=100% border="0" class="review">'
    html += `<tr class="title"><td>${pObj.name} unequipped mods in loadouts</td></tr>`
    let oddCount = 0
    for(let i in mods){
      html += `<tr class="${getBkCSS(oddCount)}"><td>${mods[i]?.tab} > ${mods[i]?.name} > ${mods[i]?.modNameKey}-${mods[i]?.slot}</td></tr>`
      oddCount++
    }
    html += '</table>'
  html += '</body>'
  return html
}
