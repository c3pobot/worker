'use strict'
const isOdd = (num)=>{
  return num % 2
}
const getBasicInfo = (home = {}, away = {})=>{
  try{
    let html = ''
    html += '<tr class="row-even"><td class="stat-name">GP</td><td class="home-guild">'+(home.gp?.toLocaleString() || 0)+'</td><td class="away-guild">'+(away.gp?.toLocaleString() || 0)+'</td></tr>'
    html += '<tr class="row-odd"><td class="stat-name">Char GP</td><td class="home-guild">'+(home.gpChar?.toLocaleString() || 0)+'</td><td class="away-guild">'+(away.gpChar?.toLocaleString() || 0)+'</td></tr>'
    html += '<tr class="row-even"><td class="stat-name">Ship GP</td><td class="home-guild">'+(home.gpShip?.toLocaleString() || 0)+'</td><td class="away-guild">'+(away.gpShip?.toLocaleString() || 0)+'</td></tr>'
    html += '<tr class="row-odd"><td class="stat-name">Zeta</td><td class="home-guild">'+(home.zeta?.toLocaleString() || 0)+'</td><td class="away-guild">'+(away.zeta?.toLocaleString() || 0)+'</td></tr>'
    html += '<tr class="row-even"><td class="stat-name">R6 Mods</td><td class="home-guild">'+(home.mod?.r6?.toLocaleString() || 0)+'</td><td class="away-guild">'+(away.mod?.r6?.toLocaleString() || 0)+'</td></tr>'
    html += '<tr class="row-odd"><td class="stat-name">Gl\'s</td><td class="home-guild">'+(home.gl?.total?.toLocaleString() || 0)+'</td><td class="away-guild">'+(away.gl?.total?.toLocaleString() || 0)+'</td></tr>'
    html += '<tr class="row-even"><td class="stat-name">TW Omi</td><td class="home-guild">'+(home.omi?.tw?.toLocaleString() || 0)+'</td><td class="away-guild">'+(away.omi?.tw?.toLocaleString() || 0)+'</td></tr>'
    html += '<tr class="row-odd"><td class="stat-name">TW Record</td><td class="home-guild">'+(home.record?.w || 0)+' - '+(home.record?.l || 0)+'</td><td class="away-guild">'+(away.record?.w || 0)+' - '+(away.record?.l || 0)+'</td></tr>'
    html += '<tr class="row-even"><td class="stat-name">TW Last</td><td class="home-guild">'+(home?.record?.last?.status === 'L' ? 'Loss':'Win')+'</td><td class="away-guild">'+(away?.record?.last?.status === 'L' ? 'Loss':'Win')+'</td></tr>'
    return html
  }catch(e){
    throw(e)
  }
}
const getUnitInfo = (home = {}, away = {})=>{
  try{
    let html = '', relicMin = 4, relicMax = 9, oddCount = 0, rarityMin = 3, rarityMax = 7
    let getBkClass = () =>{
      let bkclass = 'row-even'
      if(isOdd(oddCount)){
        bkclass = 'row-odd'
      }else{
        bkclass = 'row-even'
      }
      oddCount++
      return bkclass
    }
    for(let i in home){
      html += '<tr class="stat-title"><td class="stat-name">'+home[i].nameKey+'</td><td class="home-guild">'+home[i].count+'</td><td class="away-guild">'+(away[i]?.count || 0)+'</td></tr>'
      if(home[i].combatType === 1){
        html += '<tr class="'+getBkClass()+'"><td class="stat-name">Reliced</td><td class="home-guild"</td>'+(home[i].relicCount?.total || 0)+'<td class="away-guild">'+(away[i]?.relicCount?.total || 0)+'</td></tr>'
        for(let r = relicMax; r > relicMin;r--){
          if(home[i]?.relicCount[r] || away[i]?.relicCount[r]){
            html += '<tr class="'+getBkClass()+'"><td class="stat-name">R'+r+'</td><td class="home-guild"</td>'+(home[i]?.relicCount[r] || 0)+'<td class="away-guild">'+(away[i]?.relicCount[r] || 0)+'</td></tr>'
          }
        }
        if(home[i]?.zetaCount?.some || away[i]?.zetaCount?.some) html += '<tr class="'+getBkClass()+'"><td class="stat-name">Some Zeta\'s</td><td class="home-guild"</td>'+(home[i].zetaCount?.some || 0)+'<td class="away-guild">'+(away[i]?.zetaCount?.some || 0)+'</td></tr>'
        if(home[i]?.zetaCount?.all || away[i]?.zetaCount?.all) html += '<tr class="'+getBkClass()+'"><td class="stat-name">All Zeta\'s</td><td class="home-guild"</td>'+(home[i].zetaCount?.all || 0)+'<td class="away-guild">'+(away[i]?.zetaCount?.all || 0)+'</td></tr>'
        if(home[i]?.omiCount?.some || away[i]?.omiCount?.some) html += '<tr class="'+getBkClass()+'"><td class="stat-name">Some Omi\'s</td><td class="home-guild"</td>'+(home[i].omiCount?.some || 0)+'<td class="away-guild">'+(away[i]?.omiCount?.some || 0)+'</td></tr>'
        if(home[i]?.omiCount?.all || away[i]?.omiCount?.all) html += '<tr class="'+getBkClass()+'"><td class="stat-name">All Omi\'s</td><td class="home-guild"</td>'+(home[i].omiCount?.all || 0)+'<td class="away-guild">'+(away[i]?.omiCount?.all || 0)+'</td></tr>'
        if(home[i]?.isGl) html += '<tr class="'+getBkClass()+'"><td class="stat-name">Ultimate</td><td class="home-guild"</td>'+(home[i].ultimateCount || 0)+'<td class="away-guild">'+(away[i]?.ultimateCount || 0)+'</td></tr>'
      }else{
        for(let r = rarityMax; r > rarityMin;r--){
          if(home[i]?.rarityCount[r] || away[i]?.rarityCount[r]){
            html += '<tr class="'+getBkClass()+'"><td class="stat-name">'+r+' Star</td><td class="home-guild"</td>'+(home[i]?.rarityCount[r] || 0)+'<td class="away-guild">'+(away[i]?.rarityCount[r] || 0)+'</td></tr>'
          }
        }
      }
    }
    return html
  }catch(e){
    throw(e)
  }
}
module.exports = ({home = {}, away = {}, gl, char, ship })=>{
  try{
    let html = ''
    html += '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
    html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
    html += '<link href="/css/twreport.css" rel="stylesheet">'
    html += '</head>'
    html += '<body>'
    html += '<table class="main-table">'
    html += '<tr class="main-header"><td class="stat-name">Guilds</td><td class="home-guild">'+home.name+' ('+home.joined+')</td><td class="away-guild">'+away.name+' ('+away.joined+')</td></tr>'
    html += getBasicInfo(home, away)
    if(gl){
      html += '<tr class="section-title"><td colSpan="3">Galactic Legend Comparison</td></tr>'
      html += getUnitInfo(gl.home, gl.away)
    }
    if(char){
      html += '<tr class="section-title"><td colSpan="3">Character Comparison</td></tr>'
      html += getUnitInfo(char.home, char.away)
    }
    if(ship){
      html += '<tr class="section-title"><td colSpan="3">Ship Comparison</td></tr>'
      html += getUnitInfo(ship.home, ship.away)
    }
    html += '</table>'
    html += '</body>'
    return html
  }catch(e){
    throw(e)
  }
}
