'use strict'
const { configMaps } = require('helpers/configMaps')
const sorter = require('json-array-sorter')
const enumAlignment = {
  'alignment_neutral': 1,
  'alignment_light': 2,
  'alignment_dark': 3
}
const enumCol = {
  1: '100%',
  2: '50%',
  3: '33.33333333%'
}
module.exports = async({ squads = [], info = {} })=>{
  try{
    let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
    html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
    html += '<link href="/css/counter.css" rel="stylesheet">'
    html += '<link href="/css/unitImg.css" rel="stylesheet">'
    html += '</head>'
    html += '<body>'
    html += '<table width="1025px"><tr><td>'
      html += '<div class="list-group-item p-a">'
        html += '<div class="header-text">'+info.header+'</div>'
      html += '</div>'
      html += '<div class="list-group-item p-a text-center">'
      html += '<div class="option-text">League : '+info.league+'</div>'
      html += '<div class="option-text">Min # battles : '+info.battles+'</div>'
      if(info.units?.length > 0){
        for(let i in info.units){
          html += '<div class="option-text">'+configMaps.UnitMap[info.units[i]]?.nameKey+'</div>'
        }
      }
      if(info.exclude_gl) html += '<div class="option-text">Exclude GL</div>'
      if(info.gl_only) html += '<div class="option-text">GL Only</div>'
      html += '</div>'
      for(let i in squads){
        html += '<div class="list-group-item p-a">'
          html += '<div class="panel" style="padding: 10px 0;">'
          html += '<div class="row">'
            html += '<div class="col-md-4 text-right squads">'
            for(let u in squads[i].attack){
              html += '<div class="character-portrait character-portrait--size-small">'
              html += '<div class="character-portrait__image-frame character-portrait__image-frame--size-small '+(configMaps.UnitMap[squads[i].attack[u]]?.isGL ? 'character-portrait__image-frame--is-galactic-legend':'character-portrait__image-frame--alignment-'+enumAlignment[configMaps.UnitMap[squads[i].attack[u]].alignment])+'"><img class="character-portrait__img character-portrait__img--size-small" src=/thumbnail/'+configMaps.UnitMap[squads[i].attack[u]]?.icon+'.png></div>'
              html += '</div>'
            }
            html += '</div>'
            html += '<div class="col-md-4 text-center squads">'
              html += '<div class="row" margin: 10px 0;>'
              html += '<div class="col-xs-4"><strong>Seen</strong><br>'+squads[i].seen+'</div>'
              html += '<div class="col-xs-4"><strong>Win %</strong><br>'+squads[i].rate+'</div>'
              html += '</div>'
            html += '</div>'
            html += '<div class="col-md-4 squads">'
            for(let u in squads[i].defense){
              html += '<div class="character-portrait character-portrait--size-small">'
              html += '<div class="character-portrait__image-frame character-portrait__image-frame--size-small '+(configMaps.UnitMap[squads[i].defense[u]]?.isGL ? 'character-portrait__image-frame--is-galactic-legend':'character-portrait__image-frame--alignment-'+enumAlignment[configMaps.UnitMap[squads[i].defense[u]].alignment])+'"><img class="character-portrait__img character-portrait__img--size-small" src=/thumbnail/'+configMaps.UnitMap[squads[i].defense[u]]?.icon+'.png></div>'
              html += '</div>'
            }
            html += '</div>'
          html += '</div>'
          html += '</div>'
          html += '</div>'
      }
      html += '<div class="list-group-item p-a">'
      html += '</div>'
      html += '</td></tr></table>'
    html += '</body>'
    html += '</html>'
    return html
  }catch(e){
    throw(e);
  }
}
