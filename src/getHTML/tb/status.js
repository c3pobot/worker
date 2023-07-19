'use strict'
const CalcAverage = (score = 0, completed = 0)=>{
  try{
    let res = 0
    if(+completed > 0) res = Math.floor(+score / +completed)
    return res.toLocaleString()
  }catch(e){
    throw(e);
  }
}
module.exports = ( data = {} )=>{
  try{
    let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
    html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
    html += '<link href="/css/tbstatus.css" rel="stylesheet">'
    html += '</head>'
    html += '<body>'
    html += '<table width="1800px" border="0" class="review">'

    html += '<tr class="title">'
      html += '<td colspan="3">'+data.guildName+' '+data.nameKey+' Total Stars : '+data.star+'</td>'
    html += '</tr>'
    html += '<tr class="dkbg"><td>GP</td><td>Total</td><td>Undeployed</td></tr>'
    if(data.gp.showTotalGp){
      html += '<tr class="ltbg"><td>Total</td><td>'+data.gp.guild.total?.toLocaleString()+'</td><td>'+(data.gp.guild.total - data.gp.deployed.total).toLocaleString()+'</td></tr>'
    }else{
      html += '<tr class="ltbg"><td>Char</td><td>'+data.gp.guild.char?.toLocaleString()+'</td><td>'+(data.gp.guild.char - data.gp.deployed.char).toLocaleString()+'</td></tr>'
      html += '<tr class="ltbg"><td>Ship</td><td>'+data.gp.guild.ship?.toLocaleString()+'</td><td>'+(data.gp.guild.ship - data.gp.deployed.ship).toLocaleString()+'</td></tr>'
    }
    for(let i in data.zoneData){
      let platoonScore = data.zoneData[i].platoon.reduce((acc, platoon) => acc + +platoon.score, 0)
      html += '<tr class="title"><td>'+data.zoneData[i].phase+'-'+data.zoneData[i].conflict+'-'+data.zoneData[i].type+' '+data.zoneData[i].nameKey+' - Stars : '+data.zoneData[i].star.current+'</td><td colspan="2">'+(+data.zoneData[i].score)?.toLocaleString()+'</td></tr>'
      html += '<tr class="dkbg"><td>Platoons</td><td colspan="2">'+platoonScore.toLocaleString()+'</td></tr>'
      if(data.zoneData[i]?.combat?.length > 0){
        let cmTotalScore = data.zoneData[i].combat.reduce((acc, combat) => acc + +combat.score, 0)
        html += '<tr class="dkbg"><td>Combat Missions</td><td>Avg</td><td>Total</td></tr>'
        for(let m in data.zoneData[i].combat){
          html += '<tr class="ltbg"><td>'+data.zoneData[i].combat[m].playersParticipated.toString().padStart(2, ' ')+'/'+data.memberCount+' ('+(data.zoneData[i].combat[m].combatType === 1? 'C':'S')+')</td><td>'+CalcAverage(data.zoneData[i].combat[m].score, data.zoneData[i].combat[m].playersParticipated)+'</td><td>'+(+data.zoneData[i].combat[m].score)?.toLocaleString()+'</td></tr>'
        }
        html += '<tr class="dkbg"><td>Combat Missions Combined</td><td>Average</td><td>Total</td></tr>'
        html += '<tr class="ltbg"><td>'+data.currentStat['strike_attempt_zone_'+data.zoneData[i].zoneId]?.total+'/'+(+data.zoneData[i].combat?.length * +data.memberCount)+'</td><td>'+CalcAverage(cmTotalScore, data.currentStat['strike_attempt_zone_'+data.zoneData[i].zoneId]?.total)+'</td><td>'+cmTotalScore.toLocaleString()+'</td></tr>'
      }
      if(data.zoneData[i].special?.length>0){
        html += '<tr class="dkbg"><td>Special Missions</td><td colspan="2">Successful</td></tr>'
        for(let m in data.zoneData[i].special) html += '<tr class="ltbg"><td>'+data.zoneData[i].special[m].playersParticipated.toString().padStart(2, ' ')+'/'+data.memberCount+'</td><td colspan="2">'+data.zoneData[i].special[m].successfulAttempts+'</td></tr>'
      }
      html += '<tr class="dkbg"><td>To Star</td><td colspan="2">Points Needed</td></tr>'
      if(data.zoneData[i]?.star["1"]) html += '<tr class="ltbg"><td>1</td><td colspan="2">'+data.zoneData[i].star["1"]?.toLocaleString()+'</td></tr>'
      if(data.zoneData[i]?.star["2"]) html += '<tr class="ltbg"><td>2</td><td colspan="2">'+data.zoneData[i].star["2"]?.toLocaleString()+'</td></tr>'
      if(data.zoneData[i]?.star["3"]) html += '<tr class="ltbg"><td>3</td><td colspan="2">'+data.zoneData[i].star["3"]?.toLocaleString()+'</td></tr>'
    }
    html += '<tr class="title"><td colspan="3">Round '+data.currentRound+' Ends in: '+data.endTime.h+':'+data.endTime.m+':'+data.endTime.s+'</td></tr>'
    html += '</tr>'
    html += '</table>'
    html += '</body>'
    html += '</html>'
    return html
  }catch(e){
    throw(e);
  }
}
