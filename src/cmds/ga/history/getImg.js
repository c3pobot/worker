'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const pipeline = require('./mongoPipeline')
const sortOption = [{column: 'startTime', order: 'ascending'}]
const getHTML = require('webimg').ga
const { getOptValue, replyButton, getImg } = require('src/helpers')

module.exports = async(playerId, opt = [], obj = {})=>{
  let msg2send = { content: 'Error getting ga history' }, gaEvent, pObj, gaMatch, webData, webImg
  let ggId = getOptValue(opt, 'ga-date')
  let round = getOptValue(opt, 'round', 1)
  let holdOnly = getOptValue(opt, 'hold-only', false)
  if(round) round = +round
  let side = await getOptValue(opt, 'side', 'd')
  if(obj.confirm?.round) round = +obj.confirm.round
  if(obj.confirm?.side) side = obj.confirm.side
  if(obj.confirm) await replyButton(obj, 'Getting info for **'+(side === 'd' ? 'Defense':'Attack')+'** Round '+round+'...')
  if(ggId){
    msg2send.content = 'Error finding eventInstanceId for id '+ggId
    gaEvent = (await mongo.find('gaScanStatus', {ggId: ggId}, {_id: 0, eventInstanceId: 1, date: 1, mode: 1, season: 1}))[0]
  }
  if(gaEvent?.eventInstanceId){
    msg2send.content = 'Error finding GA history for '+gaEvent.mode+' '+gaEvent.date
    pObj = (await mongo.aggregate('gaHistory', {_id: playerId+'-'+gaEvent.eventInstanceId}, JSON.parse(JSON.stringify(pipeline))))[0]
  }
  if(pObj?.matchResult?.length > 0 && round > 0){
    let actionRow = {type: 1, components: []}
    actionRow.components.push({
      type: 2,
      label: (side === 'd' ? 'Attack':'Defense'),
      style: 1,
      custom_id: JSON.stringify({id: obj.id, side: (side === 'd' ? 'a':'d'), round: round})
    })
    for(let i = 1;i<4;i++){
      if(+i !== round) actionRow.components.push({
        type: 2,
        label: 'Round '+i,
        style: 1,
        custom_id: JSON.stringify({id: obj.id, side: side, round: +i})
      })
    }
    if(actionRow?.components?.length > 0) msg2send.components = [actionRow]
  }
  if(pObj?.matchResult?.length > 0 && round > 0){
    msg2send.content = 'Error finding GA history for '+gaEvent.mode+' '+gaEvent.date+' round '+round
    gaMatch = pObj.matchResult.find(x=>x.matchId === round)
  }
  if(gaMatch?.attackResult && gaMatch?.defenseResult && holdOnly){
    msg2send.content = 'There where no defense holds'
    gaMatch.attackResult =  gaMatch.attackResult.filter(x=>x.battleOutcome !== 1)
    gaMatch.defenseResult =  gaMatch.defenseResult.filter(x=>x.battleOutcome !== 1)
  }

  if((gaMatch?.attackResult?.length > 0 && side === 'a') || (gaMatch?.defenseResult?.length > 0 && side === 'd')){
    msg2send.content = 'Error getting html'
    gaEvent.side = side
    gaEvent.holdOnly = holdOnly
    gaMatch.attackResult = sorter(sortOption, gaMatch.attackResult)
    gaMatch.defenseResult = sorter(sortOption, gaMatch.defenseResult)
    webData = await getHTML.history(gaMatch, gaEvent)
  }
  if(webData){
    msg2send.content = 'Error getting image'
    let width = 990
    if(gaEvent.mode === '5v5') width = 1800
    webImg = await getImg(webData, obj.id, width, false)
  }
  if(webImg){
    msg2send.content = null
    msg2send.file = webImg
    msg2send.fileName = 'ga-history.png'
  }
  return msg2send
}
