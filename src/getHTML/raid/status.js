'use strict'
const isOdd = (num)=>{
  return num % 2
}
module.exports = ({profile = {}, leaderBoard = [], reward = {}, nameKey, score, footer, type = 'history'})=>{
  try{
    let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">', oddCount = 0, colspan = 3
    if(type === 'history') colspan = 2
    const getBkg = (score)=>{
      let res = 'bk-even'
      if(isOdd(oddCount)) res = 'bk-odd'
      if(score === 0) res = 'bk-low'
      oddCount++
      return res
    }
    html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
    html += '<link href="/css/raid.css" rel="stylesheet">'
    html += '</head>'
    html += '<body>'
    html += '<table class="main-table">'
      html += '<tr class="title"><td colspan="'+colspan+'">'+profile?.name+' '+nameKey+'</td></tr>'
      if(type === 'history'){
        html += '<tr class="player-title"><td>Player</td><td>Score</td>'
      }else{
        html += '<tr class="player-title"><td>Player</td><td>Current</td><td>Last</td>'
      }
      for(let i in leaderBoard){
        html += '<tr class="'+getBkg(+leaderBoard[i].memberProgress)+'">'
          html += '<td class="player-name">'+leaderBoard[i].name+'</td>'
          html += '<td class"player-currnet">'+(+leaderBoard[i].memberProgress || 0).toLocaleString()+'</td>'
          if(type !== 'history') html += '<td class="player-last">'+(+leaderBoard[i].previous || 0).toLocaleString()+'</td>'
        html += '</tr>'
      }
    html += '<tr>'
      html += '<td colspan="'+colspan+'">'
        html += '<table class="reward-table">'
          html += '<tr>'
            html += '<td class="reward-current">'
              if(reward?.current){
                html += '<img src="/thumbnail/'+reward.current.texture+'.png" class="reward-chest"/>'
              }else{
                html += 'nbsp;'
              }
            html += '</td>'
            html += '<td class="reward-progress">'
              if(reward?.next){
                html += '<div class="progess-bar">'
                    html += '<div class="progess-bar-fill" style="width: '+Math.floor(((score - reward.current.rankStart) / (reward.current.rankEnd - reward.current.rankStart)) * 100)+'%;"/>'
                html += '</div>'
              }else{
                html += 'nbsp;'
              }
            html += '</td>'
            html += '<td class="reward-next">'
            if(reward?.next){
              html += '<img src="/thumbnail/'+reward.next.texture+'.png" class="reward-chest"/>'
            }else{
              html += 'nbsp;'
            }
            html += '</td>'
          html += '</tr>'
          html += '<tr>'
            html += '<td class="reward-current-score">'
              if(reward?.current){
                html += reward.current.rankStart?.toLocaleString()
              }else{
                html += 'nbsp;'
              }
            html += '</td>'
            html += '<td class="current-score">'+score?.toLocaleString()+'</td>'
            html += '<td class="reward-next-score">'
              if(reward?.next){
                html += reward.next.rankStart?.toLocaleString()
              }else{
                html += 'nbsp;'
              }
            html += '</td>'
          html += '</tr>'
        html += '</table>'
      html += '</td>'
    html += '</tr>'
    if(footer){
      html += '<tr class="footer">'
        html += '<td colspan="'+colspan+'" align="center">'+footer+'</td>'
      html += '</tr>'
    }
    html += '</table>'
    html += '</body>'
    html += '</html>'
    return html
  }catch(e){
    throw(e);
  }
}
