'use strict'
const getUnitImg = require('../getUnitImg')
const isOdd = (num)=>{
  return num % 2
}
const getPlayers = (players = [])=>{
  try{
    let i = players.length, html = ''
    if(players?.length > 0){
      while(i--) html += '<tr><td class="zone-unit-player-td">'+players[i].name+'</td></tr>'
    }else{
      html += '<tr><td class="zone-unit-player-td">no one has the required unit</td></tr>'
    }
    return html
  }catch(e){
    throw(e)
  }
}
const getUnits = (units = {}, showPlayers) => {
  try{
    let html = '<table class="zone-units-table">', oddCount = 0
    for(let i in units){
      let bgClass = 'zone-unit-even'
      if(isOdd(oddCount)) bgClass = 'zone-unit-odd'
      ++oddCount
      html += '<tr class="'+bgClass+'">'
        html += '<td class="zone-unit-image">'
          html += getUnitImg(units[i], false)
        html += '</td>'
        html += '<td class="zone-unit-players-td">'
          html += '<table class="zone-unit-players-table">'
            html += '<tr><td class="zone-unit-player-td-title">Missing '+units[i].missing+' '+units[i].nameKey+'</td></tr>'
            if(showPlayers) html += getPlayers(units[i].players)
          html += '</table>'
        html += '</td>'
      html += '</tr>'
    }
    html += '</table>'
    return html
  }catch(e){
    throw(e)
  }
}
module.exports = ({ name, tbName,  showPlayers, currentRound, missingUnitMap = [], timeTillEnd = {}})=>{
  try{
    let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
    html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
    html += '<link href="/css/tbMissingPlatoons.css" rel="stylesheet">'
    html += '<link href="/css/unitImg.css" rel="stylesheet">'
    html += '</head>'
    html += '<body>'
    html += '<table class="main-table">'
      html += '<tr><td class="title">'+name+': '+tbName+' missing platoon units</td></tr>'
      if(!showPlayers) html += '<tr><td class="player-note">*Note: there is to many unassigned units to show possible players to fill.</td></tr>'
      for(let i in missingUnitMap){
        html += '<tr><td class="zone-title">'+missingUnitMap[i].key+' '+missingUnitMap[i].type+' '+missingUnitMap[i].nameKey+'</td></tr>'

        html += '<tr>'
          html += '<td class="zone-unit-td">'
          html += getUnits(missingUnitMap[i].units, showPlayers)
          html += '</td>'
        html += '</tr>'
      }
      html += '<tr class="footer-text"><td>Round '+currentRound+' Ends in: '+timeTillEnd.h+':'+timeTillEnd.m+':'+timeTillEnd.s+'</td></tr>'
    html += '</table>'
    html += '</body>'
    html += '</html>'
    return html
  }catch(e){
    throw(e)
  }
}
