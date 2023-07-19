'use strict'
module.exports = (mat = {})=>{
  let html = '<div>'
    html += '<img class="gear-icon gear-icon-img" src="/asset/'+mat.iconKey+'.png">'
  html += '</div>'
  return html
}
