'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const getHTML = require('webimg').ga
const pipeline = require('./mongoPipeline')
const sortOption = [{column: 'startTime', order: 'ascending'}]

const { getImg, replyMsg, replyComponent } = require('src/helpers')

module.exports = async(obj = {}, opt = {}, playerId)=>{
  if(!playerId) return { content: `playerId not provided..` }

  let ggId = opt['ga-date']?.value, round = +(opt.round?.value || 1), holdOnly = opt['hold-only']?.value || false, side = opt.side?.value || 'd'
  if(obj.confirm?.round) round = +obj.confirm.round
  if(obj.confirm?.side) side = obj.confirm.side
  if(!ggId) return { content: 'you did not specify a date..' }

  let gaEvent = (await mongo.find('gaScanStatus', { ggId: ggId }, { _id: 0, eventInstanceId: 1, date: 1, mode: 1, season: 1 }))[0]
  if(!gaEvent) return { content: `error finding eventId for ${ggId}` }

  let pObj = (await mongo.aggregate('gaHistory', { _id: playerId+'-'+gaEvent.eventInstanceId }, JSON.parse(JSON.stringify(pipeline))))[0]
  if(!pObj?.matchResult || pObj?.matchResult?.length == 0) return { content: `Error finding ga history for ${gaEvent.mode} ${gaEvent.data}` }

  let gaMatch = pObj.matchResult.find(x=>x.matchId === round)
  if(!gaMatch?.attackResult || !gaMatch?.defenseResult) return { content: `error finding ga history for ${gaEvent.mode} ${gaEvent.date} round ${round}` }
  if(holdOnly){
    gaMatch.attackResult =  gaMatch.attackResult.filter(x=>x.battleOutcome !== 1)
    gaMatch.defenseResult =  gaMatch.defenseResult.filter(x=>x.battleOutcome !== 1)
  }
  if((gaMatch?.attackResult?.length == 0 && side === 'a') || (gaMatch?.defenseResult?.length == 0 && side === 'd')){
    if(holdOnly) return { content: 'There where no defense holds' }
    return { content: `error finding battles for ${gaEvent.mode} ${gaEvent.date} round ${round} ${side == 'd' ? 'defense':'attack'}` }
  }

  let msg2send = { content: null, components: [] }
  let actionRow = { type: 1, components: [] }
  actionRow.components.push({
    type: 2,
    label: (side === 'd' ? 'Attack':'Defense'),
    style: 1,
    custom_id: JSON.stringify({id: obj.id, dId: obj.member?.user?.id, side: (side === 'd' ? 'a':'d'), round: round})
  })
  for(let i = 1;i<4;i++){
    if(+i !== round) actionRow.components.push({
      type: 2,
      label: 'Round '+i,
      style: 1,
      custom_id: JSON.stringify({id: obj.id, dId: obj.member?.user?.id, side: side, round: +i})
    })
  }
  if(actionRow?.components?.length > 0) msg2send.components = [actionRow]
  gaEvent.side = side
  gaEvent.holdOnly = holdOnly
  gaMatch.attackResult = sorter(sortOption, gaMatch.attackResult)
  gaMatch.defenseResult = sorter(sortOption, gaMatch.defenseResult)
  let webData = await getHTML.history(gaMatch, gaEvent)
  if(!webData) return { content: 'error getting html' }

  let width = 990
  if(gaEvent.mode === '5v5') width = 1800
  let webImg = await getImg(webData, obj.id, width, false)
  if(!webImg) return { content: 'error getting image' }

  msg2send.file = webImg, msg2send.fileName = 'ga-history.png'
  await replyComponent(obj, msg2send, 'POST')
}
