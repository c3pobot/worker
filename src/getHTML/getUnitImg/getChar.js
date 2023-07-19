'use strict'

const getImg = (unit = {})=>{
  try{
    let html = '<div class="character-portrait__image-frame character-portrait__image-frame--size-normal">'
    html += '<img class="character-portrait__img character-portrait__img--size-normal" src="/thumbnail/'+unit.icon+'.png"/>'
    html += '</div>'
    return html
  }catch(e){
    throw(e)
  }
}
const getGear = (unit = {})=>{
  try{
    let html = ''
    if(unit.relicTier >= 0 && unit.gearTier >= 13){
      if(unit.relicTier > 0){
        html += '<div class="character-portrait__relic character-portrait__relic--size-normal character-portrait__relic--alignment-'+unit.alignment+''+(unit.ultimate ? ' character-portrait__relic--ultimate':'')+'">'+(+unit.relicTier)+'</div>'
      }else{
        html += '<div class="character-portrait__level character-portrait__level--size-normal">'+(unit.level || 85)+'</div>'
      }
      html += '<div class="character-portrait__rframe character-portrait__rframe--size-normal character-portrait__rframe--alignment-'+unit.alignment+'"></div>'
      html += '<div class="character-portrait__rframe character-portrait__rframe--right character-portrait__rframe--size-normal character-portrait__rframe--alignment-'+unit.alignment+'"></div>'
    }else{
      html += '<div class="character-portrait__gframe character-portrait__gframe--tier-'+unit.gearTier+'"></div>'
      html += '<div class="character-portrait__level character-portrait__level--size-normal">'+(unit.level || 85)+'</div>'
    }
    return html
  }catch(e){
    throw(e)
  }
}
const getRarity = (unit = {})=>{
  try{
    let html = '<div class="character-portrait__footer character-portrait__footer--size-normal">'
      html += '<div class="character-portrait__stars">'
        html += '<div class="'+(unit.rarity < 1 ? 'character-portrait__star--inactive':'character-portrait__star')+' character-portrait__star--size-normal"></div>'
        html += '<div class="'+(unit.rarity < 2 ? 'character-portrait__star--inactive':'character-portrait__star')+' character-portrait__star--size-normal"></div>'
        html += '<div class="'+(unit.rarity < 3 ? 'character-portrait__star--inactive':'character-portrait__star')+' character-portrait__star--size-normal"></div>'
        html += '<div class="'+(unit.rarity < 4 ? 'character-portrait__star--inactive':'character-portrait__star')+' character-portrait__star--size-normal"></div>'
        html += '<div class="'+(unit.rarity < 5 ? 'character-portrait__star--inactive':'character-portrait__star')+' character-portrait__star--size-normal"></div>'
        html += '<div class="'+(unit.rarity < 6 ? 'character-portrait__star--inactive':'character-portrait__star')+' character-portrait__star--size-normal"></div>'
        html += '<div class="'+(unit.rarity < 7 ? 'character-portrait__star--inactive':'character-portrait__star')+' character-portrait__star--size-normal"></div>'
      html += '</div>'
    html += '</div>'
    return html
  }catch(e){
    throw(e)
  }
}
module.exports = (unit = {}, showName = true)=>{
  try{
    let html = ''
    html += '<div>'
      html += '<div class="col-xs-6 col-sm-3 col-md-3 col-lg-2">'
        html += '<div class="collection-char">'
          html += '<div class="character-portrait">'
            html += '<div class="character-portrait__primary character-portrait__primary--size-normal">'
            html += getImg(unit)
            html += getGear(unit)
            html += '</div>'
            html += getRarity(unit)
          html += '</div>'
        html += '</div>'
      html += '</div>'
      if(showName) html += '<div class="collection-char-name">'+unit.nameKey+'</div>'
    html += '</div>'
    return html
  }catch(e){
    throw(e)
  }
}
