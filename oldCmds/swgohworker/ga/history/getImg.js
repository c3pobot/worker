'use strict'
const pipeline = require('./mongoPipeline')
const sortOption = [{column: 'startTime', order: 'ascending'}]
const GetHTML = require('webimg').ga
module.exports = async(playerId, opt = [], obj = {})=>{
  try{
    let msg2send = { content: 'Error getting ga history' }, gaEvent, pObj, gaMatch, webData, webImg
    let ggId = await HP.GetOptValue(opt, 'ga-date')
    let round = await HP.GetOptValue(opt, 'round', 1)
    let holdOnly = await HP.GetOptValue(opt, 'hold-only', false)
    if(round) round = +round
    let side = await HP.GetOptValue(opt, 'side', 'd')
    if(obj.confirm?.round) round = +obj.confirm.round
    if(obj.confirm?.side) side = obj.confirm.side
    if(obj.confirm) await HP.ReplyButton(obj, 'Getting info for **'+(side === 'd' ? 'Defense':'Attack')+'** Round '+round+'...')
    if(ggId){
      msg2send.content = 'Error finding eventInstanceId for id '+ggId
      gaEvent = (await mongo.find('gaScanStatus', {ggId: ggId}, {_id: 0, eventInstanceId: 1, date: 1, mode: 1, season: 1}))[0]
    }
    if(gaEvent?.eventInstanceId){
      msg2send.content = 'Error finding GA history for '+gaEvent.mode+' '+gaEvent.date
      pObj = (await mongo.aggregate('gaHistory', {_id: playerId+'-'+gaEvent.eventInstanceId}, JSON.parse(JSON.stringify(pipeline))))[0]
    }
    if(pObj?.matchResult?.length > 0 && round > 0){
      const actionRow = {type: 1, components: []}
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
      gaMatch.attackResult = await sorter(sortOption, gaMatch.attackResult)
      gaMatch.defenseResult = await sorter(sortOption, gaMatch.defenseResult)
      webData = await GetHTML.history(gaMatch, gaEvent)
      //await redis.set('w-gahist', {data: gaMatch, info: gaEvent})
    }
    if(webData){
      msg2send.content = 'Error getting image'
      let width = 990
      if(gaEvent.mode === '5v5') width = 1800
      webImg = await HP.GetImg(webData, width, false)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = 'ga-history.png'
    }
    return msg2send
  }catch(e){
    console.error(e);
  }
}
