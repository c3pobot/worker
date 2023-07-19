'use strict'
const getGearImg = require('../getGearImg')
const getRelicImg = require('../getRelicImg')
const getUnitImg = require('../getUnitImg/getCrew')
const isOdd = (num)=>{
  return num % 2
}
module.exports = ({ gear = [], relicMats = [], gearLevel, relicLevel, header, unit = {}, updated, includeInventory })=>{
  try{
    let bkImg = 'gear-even', oddCount = 0, colCount = 0
    let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
    html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
    html += '<link href="/css/gear.css" rel="stylesheet">'
    html += '<link href="/css/unitImg.css" rel="stylesheet">'
    html += '<link href="/css/inventoryUnit.css" rel="stylesheet">'
    html += '</head>'
    html += '<body>'
      html += '<table class="main-table">'
        html += '<tr class="header"><td class="inventory-unit">'+getUnitImg(unit)+'</td><td colspan="2" align="left">'+header+'</td></tr>'
        //html += '<tr class="header"><td><div style="margin-left: 10px" class="character-portrait__image-frame character-portrait__image-frame--size-small"><img class="character-portrait__img character-portrait__img--size-small" src="/thumbnail/'+unitIcon+'.png"></div></td><td colspan="2" align="left">'+header+'</td></tr>'
        if(gear.length > 0){
          html += '<tr class="gear-title"><td colspan="3">Additional Gear needed for G'+gearLevel+'</td></tr>'
          if(includeInventory) html += '<tr class="gear-title"><td colspan=3>Note: gear only looks at salvage, not crafted gear/components for what is in inventory</td></tr>'
          for(let i in gear){
            if(includeInventory && gear[i].inventory >= gear[i].count) continue;
            if(isOdd(oddCount)){
              bkImg = 'gear-odd'
            }else{
              bkImg = 'gear-even'
            }
            oddCount++
            html += '<tr class="'+bkImg+'">'
              html += '<td class="gear-image">'
              html += getGearImg(gear[i])
              html += '</td>'
              html += '<td class="gear-name">'+gear[i].nameKey+'</td>'
              html += '<td class="gear-count">'
              if(includeInventory){
                html += (gear[i].inventory || 0)+'/'+gear[i].count
              }else{
                html += 'x '+gear[i].count
              }
              html += '</td>'
            html += '</tr>'
          }
        }else{
          oddCount++
          html += '<tr class="'+bkImg+'"><td colspan="3">You have all the gear needed for G'+gearLevel+'</td></tr>'
        }
        if(gearLevel === 13){
          if(relicMats.length > 0){
            if(isOdd(oddCount)){
              bkImg = 'gear-odd'
            }else{
              bkImg = 'gear-even'
            }
            html += '<tr class="gear-title"><td colspan="3">Additional Material needed for R'+relicLevel+'</td></tr>'
            for(let i in relicMats){
              if(includeInventory && relicMats[i].inventory >= relicMats[i].count) continue;
              if(isOdd(oddCount)){
                bkImg = 'gear-odd'
              }else{
                bkImg = 'gear-even'
              }
              oddCount++
              html += '<tr class="'+bkImg+'">'
                html += '<td class="gear-image"><div><img class="gear-icon gear-icon-img" src="/asset/'+relicMats[i].iconKey+'.png"></div></td>'
                html += '<td class="gear-name">'+relicMats[i].nameKey+'</td>'
                html += '<td class="gear-count">'
                if(includeInventory){
                  html += (relicMats[i].inventory || 0)+'/'+relicMats[i].count
                }else{
                  html += 'x '+relicMats[i].count
                }
                html += '</td>'
              html += '</tr>'
            }
          }else{
            if(isOdd(oddCount)){
              bkImg = 'gear-odd'
            }else{
              bkImg = 'gear-even'
            }
            html += '<tr class="'+bkImg+'"><td colspan="3">You have all the relic materials needed for R'+relicLevel+'</td></tr>'
          }
        }
        if(updated) html += '<tr><td colspan="3" class="footer">Data Updated : '+(new Date(+updated)).toLocaleString('en-US', { timeZone: 'America/New_York' })+'</td></tr>'
      html += '</table>'
    html += '</body>'
    return html
  }catch(e){
    console.error(e);
  }
}
