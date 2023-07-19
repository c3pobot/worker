'use strict'
module.exports = (data = {})=>{
  try{
    let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
    html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
    html += '<link href="/css/tbstatus.css" rel="stylesheet">'
    html += '</head>'
    html += '<body>'
    html += '<table width="1800px" border="0" class="review">'
    html += '<tr class="title">'
      html += '<td colspan="6">'+data.guildName+' Members with possible missing deployment</td>'
    html += '</tr>'
    html += '<tr class="dkbg"><td colspan="6">Possible Missing Deployment</td></tr>'
    html += '<tr class="ltbg"><td colspan="6">'+data.missing.gp.toLocaleString()+'</td></tr>'
    html += '<tr class="dkbg">'
      html += '<td>Name</td>'
      html += '<td>Deployed</td>'
      html += '<td>Not Deployed</td>'
      html += '<td>Total GP</td>'
      html += '<td>Char GP</td>'
      html += '<td>Ship GP</td>'
    html += '</tr>'
    let i = data.missing.players.length
    while(i--){
      html += '<tr class="ltbg">'
        html += '<td>'+data.missing.players[i].name+'</td>'
        html += '<td>'+data.missing.players[i].deployed.toLocaleString()+'</td>'
        html += '<td>'+(data.missing.players[i].gp[3] - data.missing.players[i].deployed).toLocaleString()+'</td>'
        html += '<td>'+data.missing.players[i].gp[3].toLocaleString()+'</td>'
        html += '<td>'+data.missing.players[i].gp[1].toLocaleString()+'</td>'
        html += '<td>'+data.missing.players[i].gp[2].toLocaleString()+'</td>'
      html += '</tr>'
    }
    html += '<tr class="title"><td colspan="3">Round '+data.currentRound+' Ends in: '+data.endTime.h+':'+data.endTime.m+':'+data.endTime.s+'</td></tr>'
    html += '</tr>'
    html += '</table>'
    html += '</body>'
    html += '</html>'
    return html
  }catch(e){
    throw(e)
  }
}
