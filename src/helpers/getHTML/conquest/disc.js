'use strict'
const isOdd = (num)=>{
  return num % 2
}
const getDiscImage = (disc = {})=>{
  try{
    let html = '<div class="disc-img">'
    html += '<div class="disc-tier"><img class="disc-src" src="/asset/'+disc.tierId+'.png"></div>'
    html += '<div class="disc-emblem"><img class="disc-src" src="/asset/'+disc.texture+'.png"></div>'
    html += '<div class="disc-power"><img class="disc-src" src="/asset/artifact-power-'+disc.powerLevel+'.png"></div>'
    html += '</div>'
    return html
  }catch(e){
    throw(e)
  }
}
module.exports = ({ name, updated, equippedDisc = [], unequppedDisc = []})=>{
  try{
    let colCount = 0, colLimit = 2, bkImg = 'row-even', oddCount = 0
    let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
    html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
    html += '<link href="/css/conquestDisc.css" rel="stylesheet">'
    html += '</head>'
    html += '<body>'
    html += '<table class="main-table">'
    //
    html += '<tr class="main-title"><td colspan="4">'+name+'\'s Galactic Conquest</td></tr>'

    if(equippedDisc?.length > 0){
      html += '<tr class="title"><td colspan="4">Equipped</td></tr>'
      let i = equippedDisc.length
      while(i--){
        if(colCount == 0){
          if(isOdd(oddCount)){
            bkImg = 'row-odd'
          }else{
            bkImg = 'row-even'
          }
          oddCount++
          html += '<tr class="'+bkImg+'">'
        }
        colCount++;
        html += '<td class="pic-td">'
        html += getDiscImage(equippedDisc[i])
        html += '</td>'
        html += '<td class="desc-td">'
          html += '<table class="disc-table">'
            html += '<tr><td class="disc-name">'+equippedDisc[i].nameKey+'</td></tr>'
            html += '<tr><td class="disc-desc">'+equippedDisc[i].descriptionKey+'</td></tr>'
          html+= '</table>'
        html += '</td>'
        if(colCount == colLimit){
          colCount = 0;
          html += "</tr>"
        }
        if(colCount != 0 && colCount != colLimit && +i === 0 ){
          colCount = 0
          html += "<td colspan='2'></td></tr>"
        }
      }
    }
    if(unequppedDisc?.length > 0){
      html += '<tr class="title"><td colspan="4">Unequipped</td></tr>'
      let i = unequppedDisc.length
      while(i--){
        if(colCount == 0){
          if(isOdd(oddCount)){
            bkImg = 'row-odd'
          }else{
            bkImg = 'row-even'
          }
          oddCount++
          html += '<tr class="'+bkImg+'">'
        }
        colCount++;
        html += '<td class="pic-td">'
        html += getDiscImage(unequppedDisc[i])
        html += '</td>'
        html += '<td class="desc-td">'
          html += '<table class="disc-table">'
            html += '<tr><td class="disc-name">'+unequppedDisc[i].nameKey+' ('+unequppedDisc[i].count+')</td></tr>'
            html += '<tr><td class="disc-desc">'+unequppedDisc[i].descriptionKey+'</td></tr>'
          html += '</table>'
        html += '</td>'
        if(colCount == colLimit){
          colCount = 0;
          html += "</tr>"
        }
        if(colCount != 0 && colCount != colLimit && +i === 0 ){
          html += "<td colspan='2'></td></tr>"
        }
      }
    }
    html += '<tr><td colspan="4" class="footer">Data Updated : '+(new Date(updated)).toLocaleString('en-US', { timeZone: 'America/New_York' })+'</td></tr>'
    //
    html += '</table>'
    html += '</body>'
    html += '</html>'
    return html
  }catch(e){
    throw(e)
  }
}
