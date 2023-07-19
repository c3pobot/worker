'use strict'
const enumAlignment = {
  'alignment_neutral': 1,
  'alignment_light': 2,
  'alignment_dark': 3
}
const getRarity = (unit = {})=>{
  try{
    let html = ''
    html += '<div class="character-portrait__footer character-portrait__footer--size-micro">'
      html += '<div class="character-portrait__stars">'
      html += '<div class="'+(unit.rarity < 1 ? 'character-portrait__star--inactive':'character-portrait__star')+' character-portrait__star--size-micro"></div>'
      html += '<div class="'+(unit.rarity < 2 ? 'character-portrait__star--inactive':'character-portrait__star')+' character-portrait__star--size-micro"></div>'
      html += '<div class="'+(unit.rarity < 3 ? 'character-portrait__star--inactive':'character-portrait__star')+' character-portrait__star--size-micro"></div>'
      html += '<div class="'+(unit.rarity < 4 ? 'character-portrait__star--inactive':'character-portrait__star')+' character-portrait__star--size-micro"></div>'
      html += '<div class="'+(unit.rarity < 5 ? 'character-portrait__star--inactive':'character-portrait__star')+' character-portrait__star--size-micro"></div>'
      html += '<div class="'+(unit.rarity < 6 ? 'character-portrait__star--inactive':'character-portrait__star')+' character-portrait__star--size-micro"></div>'
      html += '<div class="'+(unit.rarity < 7 ? 'character-portrait__star--inactive':'character-portrait__star')+' character-portrait__star--size-micro"></div>'
      html += '</div>'
    html += '</div>'
    return html
  }catch(e){
    throw(e)
  }
}
const getGear = (unit = {})=>{
  try{
    let html = '', unitAlignment = enumAlignment[unit.alignment]
    if(unit?.relicTier >= 0 && unit.gearTier >= 13){
      if(unit.relicTier > 0){
        html += '<div class="character-portrait__relic character-portrait__relic--size-micro character-portrait__relic--alignment-'+unit.alignment+''+(unit.ultimate ? ' character-portrait__relic--ultimate':'')+'">'+unit.relicTier+'</div>'
      }else{
        html += '<div class="character-portrait__level character-portrait__level--size-micro">'+(unit.level || 0)+'</div>'
      }
      html += '<div class="character-portrait__rframe character-portrait__rframe--size-micro character-portrait__rframe--alignment-'+unit.alignment+'"></div>'
      html += '<div class="character-portrait__rframe  character-portrait__rframe--right character-portrait__rframe--size-micro character-portrait__rframe--alignment-'+unit.alignment+'"></div>'
    }else{
      html += '<div class="character-portrait__gframe character-portrait__gframe--size-micro character-portrait__gframe--tier-'+unit.gearTier+'"></div>'
      html += '<div class="character-portrait__level character-portrait__level--size-micro">'+(unit.level || 0)+'</div>'
    }
    if(unit.zeta) html += '<div class="character-portrait__zeta character-portrait__zeta--size-micro">'+unit.zeta+'</div>'
    if(unit.omi) html += '<div class="character-portrait__omicron character-portrait__omicron--size-micro">'+unit.omi+'</div>'
    return html
  }catch(e){
    throw(e)
  }
}
const getImg = (unit = {})=>{
  try{
    let html = '<div class="character-portrait__image-frame character-portrait__image-frame--size-micro">'
    html += '<img class="character-portrait__img character-portrait__img--size-micro" src="/thumbnail/'+unit.icon+'.png"/>'
    html += '</div>'
    return html
  }catch(e){
    throw(e)
  }
}
module.exports = (unit = {})=>{
  try{
    let html = ''
    html += '<div>'
    html += '<div class="collection-ship-crew-member">'
      html += '<div class="character-portrait character-portrait--size-micro">'
        html += '<div class="character-portrait__primary character-portrait__primary--size-micro">'
          html += getImg(unit)
          html += getGear(unit)
        html += '</div>'
        html += getRarity(unit)
      html += '</div>'
    html += '</div>'
    html += '</div>'
    return html
  }catch(e){
    console.error(e);
  }
}
