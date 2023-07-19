'use strict'
const isOdd = (num)=>{
  return num % 2
}

const getCurrentStamina = (stamina, time)=>{
  const timeDiff = Math.floor(+Date.now() / 1000) - +time
  const mins = Math.floor(+timeDiff / 60)
  return stamina + Math.floor(+mins / 30)
}
const timeTooMax = (stamina)=>{
  let res = (100 - +stamina) * 0.5
  return res
}
module.exports = ({ name, updated, units = []})=>{
  try{
    let oddCount = 0
    const getBkg = ()=>{
      let bkImg = 'row-even'
      if(isOdd(oddCount)){
        bkImg = 'row-odd'
      }else{
        bkImg = 'row-even'
      }
      oddCount++;
      return bkImg
    }
    let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
    html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
    html += '<link href="/css/conquestStamina.css" rel="stylesheet">'
    html += '</head>'
    html += '<body>'
    html += '<table class="main-table">'

    html += '<tr class="main-title"><td colspan="3">'+name+'\'s Galactic Conquest</td></tr>'
    html += '<tr class="title"><td>Unit</td><td>Stamina</td><td>Hours Till Max</td></tr>'
    let unitCount = 0
    if(units?.length > 0){
      for(let i in units){
        let currentStamina = getCurrentStamina(units[i].remainingStamina, units[i].lastRefreshTime)
        if(currentStamina < 100){
          unitCount++;
          html += '<tr class="'+getBkg()+'"><td class="unit-name">'+units[i].nameKey+'</td><td class="unit-stamina">'+currentStamina+'%</td><td class="unit-time">'+timeTooMax(currentStamina)+'</td></tr>'
        }
      }
    }
    if(unitCount === 0) html += '<tr class="'+getBkg()+'"><td colspan="3">No units below 100% stamina</td></tr>'

    html += '<tr><td colspan="3" class="footer">Data Updated : '+(new Date(updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})+'</td></tr>'
    html += '</table>'
    html += '</body>'
    html += '</html>'
    return html
  }catch(e){
    console.error(e);
  }
}
