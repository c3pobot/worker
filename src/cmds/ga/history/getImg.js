'use strict'
const mongo = require('mongoclient')
const fetchHistory = require('./fetchHistory')
const sorter = require('json-array-sorter')
const getHTML = require('webimg').ga
const pipeline = require('./mongoPipeline')
const sortOption = [{column: 'startTime', order: 'ascending'}]

const { getImg, replyMsg, replyComponent } = require('src/helpers')

module.exports = async(obj = {}, opt = {}, playerId, mode = '5v5')=>{
  if(!playerId) return { content: `playerId not provided..` }

  let round = +(obj.confirm?.round || opt.round?.value || 1), holdOnly = opt['hold-only']?.value || false, side = (obj.confirm?.side || opt.side?.value || 'd')

  let pObj = await fetchHistory(playerId, mode)
  if(!pObj?.matchResult || pObj?.matchResult?.length == 0) return { content: `Error finding ga history for ${mode}` }

  let gaEvent = { date: pObj.date, mode: mode, season: pObj.season, eventInstanceId: pObj.eventInstanceId, league: pObj.league }

  let gaMatch = pObj.matchResult.find(x=>x.matchId === round)
  if(!gaMatch?.attackResult || !gaMatch?.defenseResult) return { content: `error finding ga history for ${gaEvent.mode} ${gaEvent.date} round ${round}` }
  if(holdOnly){
    gaMatch.attackResult =  gaMatch.attackResult.filter(x=>x.battleOutcome !== 1)
    gaMatch.defenseResult =  gaMatch.defenseResult.filter(x=>x.battleOutcome !== 1)
  }
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
  if((gaMatch?.attackResult?.length == 0 && side === 'a') || (gaMatch?.defenseResult?.length == 0 && side === 'd')){
    if(holdOnly){
      await replyComponent(obj, { content: `There where no defense holds for round ${round}`, components: [actionRow] }, 'POST')
      return
    }
    await replyComponent(obj, { content: `error finding battles for ${gaEvent.mode} ${gaEvent.date} round ${round} ${side == 'd' ? 'defense':'attack'}`, components: [actionRow] }, 'POST')
    return
  }

  let msg2send = { content: null, components: [] }

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
