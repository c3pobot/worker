'use strict'
const getGearImg = require('../getGearImg')
const getRelicImg = require('../getRelicImg')
const isOdd = (num)=>{
  return num % 2
}
module.exports = ({ player, nameKey, updated, includeInventory, gear = [], relicMats = [] })=>{
  try{
    let bkImg = 'gear-even', oddCount = 0
    let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
    html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
    html += '<link href="/css/inventoryGuide.css" rel="stylesheet">'
    html += '<link href="/css/gear.css" rel="stylesheet">'
    html += '</head>'
    html += '<body>'
      html += '<table class="main-table">'
        html += '<tr class="header"><td colspan="3">'+player+' '+nameKey+' Journey Guide<br>Gear and Relic mats needed</td></tr>'

        //html += '<tr class="header-text"><td><div style="margin-left: 10px" class="character-portrait__image-frame character-portrait__image-frame--size-small"><img class="character-portrait__img character-portrait__img--size-small" src="/thumbnail/'+uInfo.thumbnailName+'.png"></div></td><td colspan="2" align="left">'+(info.header || uInfo.nameKey)+'</td></tr>'
        if(gear?.length > 0){
          html += '<tr class="gear-title"><td colspan="3">Additional Gear needed</td></tr>'
          if(includeInventory) html += '<tr class="gear-title"><td colspan=3>Note: gear only looks at salvage, not crafted gear/components for what is in inventory</td></tr>'
          oddCount++
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
          html += '<tr class="'+bkImg+'"><td colspan="3">You have all the gear needed</td></tr>'
        }
        if(relicMats?.length > 0){
          if(isOdd(oddCount)){
            bkImg = 'gear-odd'
          }else{
            bkImg = 'gear-even'
          }
          html += '<tr class="gear-title"><td colspan="3">Additional Relic Material needed</td></tr>'
          oddCount++
          for(let i in relicMats){
            if(includeInventory && relicMats[i].inventory >= relicMats[i].count) continue;
            if(isOdd(oddCount)){
              bkImg = 'gear-odd'
            }else{
              bkImg = 'gear-even'
            }
            oddCount++
            html += '<tr class="'+bkImg+'">'
              html += '<td class="gear-image">'
              html += getRelicImg(relicMats[i])
              html += '</td>'
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
          html += '<tr class="'+bkImg+'"><td colspan="3">You have all the relic materials needed</td></tr>'

        }
        if(updated) html += '<tr><td colspan="3" class="footer">Data Updated ' + (new Date(+updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})+'</td></tr>'
      html += '</table>'
    html += '</body>'
    return html
  }catch(e){
    console.error(e);
  }
}
