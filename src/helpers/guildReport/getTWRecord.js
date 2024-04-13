'use strict'
const getResults = (twResults = {})=>{
  if(twResults?.length > 0){
    let res = {win: 0, loss: 0, last: {status: 'W', time: 0}}
    for(let i in twResults){
      if(+twResults[i].score > +twResults[i].opponentScore){
        res.win++
        if(+twResults[i].endTimeSeconds > res.last.time){
          res.last.time = +twResults[i].endTimeSeconds
          res.last.status = 'W'
        }
      }else{
        res.loss++
        if(+twResults[i].endTimeSeconds > res.last.time){
          res.last.time = +twResults[i].endTimeSeconds
          res.last.status = 'L'
        }
      }
    }
    return res
  }
}
module.exports = (homeGuild = [], awayGuild)=>{
  let len = 3, homeResults = getResults(homeGuild), awayResults = getResults(awayGuild)
  let res = {
    name: 'TW Record',
    value: '```autohotkey\n'
  }
  if(homeResults){
    res.value += 'Record : '+homeResults.win+'-'+homeResults.loss
    if(awayResults) res.value += ' vs '+awayResults.win+' - '+awayResults.loss
    res.value += '\nLast   : '
    res.value += homeResults.last?.status.padStart(3, ' ')
    if(awayResults) res.value += ' vs '+awayResults.last?.status
    res.value += '\n'
  }
  res.value += '```'
  return res
}
