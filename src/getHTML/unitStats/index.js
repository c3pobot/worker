'use strict'
const getImage = require('./getImage')
const getUnitStats = require('./getUnitStats')
const getMultipleUnitStats = require('./getMultipleUnitStats')
const getUnitMods = require('./getUnitMods')


const getDate = (timestamp)=>{
  let dateOptions = {month: 'numeric', day: 'numeric', year: 'numeric'}
  let dateTime = new Date(+timestamp)
  return dateTime.toLocaleDateString('en-US', dateOptions)+' '+dateTime.toLocaleTimeString('en-US')
}
module.exports = (data = {})=>{
  try{
    //header
    let unit = data.unit, colSpan = 1
    if(!data.unit2) colSpan = 2
    let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
    html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
    html += '<link href="/css/unitStat.css" rel="stylesheet">'
    html += '</head>'
    html += '<body>'
    html += '<table class="unit-image">'
      html += '<tr>'
        html += '<td class="unit-name">'+unit.nameKey+'</td>'
        /*
        if(!data.unit2 && unit.combatType === 1 && unit.mods){
          html += '<td rowSpan="3" valign="top" class="mods-td">'
          html += getUnitMods(unit.mods)
          html += '</td>'
        }
        */
        if(!data.unit2){
          html +='<td valign="top" class="td-stats" rowSpan="2">'
          if(!data.unit2) html += getUnitStats(unit)
          html += '</td>'
        }

        //if(data.unit2) html += getMultipleUnitStats(data)

      html += '</tr>'
      html += '<tr>'
        html += '<td valign="top">'
        html += getImage(data)
        html += '</td>'
      html += '</tr>'
      if(!data.unit2 && unit.combatType === 1 && unit.mods){
        html += '<tr><td valign="top" class="mods-td" colSpan="2">'
        html += getUnitMods(unit.mods)
        html += '</td></tr>'
      }
      if(data.player && data.updated) html += '<tr><td colSpan = "'+colSpan+'" class="footer-text">'+data.player+'\'s '+unit.nameKey+' | '+(getDate(data.updated))+'</td></tr>'
    html += '</table>'
    //mods start
    html += '</body>'
    html += '</html>'

    return html
  }catch(e){
    console.error(e)
  }
}
