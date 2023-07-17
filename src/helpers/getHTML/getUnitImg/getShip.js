'use strict'
const getImg = (unit = {})=>{
  try{
    let html = ''
    html += '<div class="character-portrait__primary character-portrait__primary--size-normal">'
      html += '<div class="ship-portrait__image-group">'
        html += '<div class="ship-portrait__image-frame">'
          html += '<img class="ship-portrait__img ship-portrait__img--size-" src="/thumbnail/'+unit.icon+'.png"/>'
        html += '</div>'
        if(unit.level) html += '<div class="ship-portrait__level ship-portrait__level--size-">'+unit.level+'</div>'
        html += '<div class="ship-portrait__frame"></div>'
      html += '</div>'
    html += '</div>'
    return html
  }catch(e){
    throw(e)
  }
}
const getRarity = (unit = {})=>{
  try{
    let html = ''
    html += '<div class="character-portrait__footer character-portrait__footer--size-normal">'
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
            html += getImg(unit)
            html += getRarity(unit)
          html += '</div>'
        html += '</div>'
      html += '</div>'
      if(showName) html += '<div class="collection-char-name">'+unit.nameKey+'</div>'
    html += '</div>'
    return html;
  }catch(e){
    throw(e)
  }
}
