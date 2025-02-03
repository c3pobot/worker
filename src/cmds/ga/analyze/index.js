'use strict'
const swgohClient = require('src/swgohClient')
const fetch = require('./fetch')

const { getDiscordAC, replyTokenError  } = require('src/helpers')
module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.resposne == 'no') return { content: 'command canceled...'}

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let allyCode = dObj?.allyCode
  if(!allyCode) return { content: 'Your allyCode is not linked to your discord id' }
  if(!dObj?.uId || !dObj?.type) return { content: 'You do not have google linked to bot' }

  let pObj = await swgohClient.oauth(obj, 'getTerritoryMapStatus', dObj, { eventType: 10 })
  if(pObj === 'GETTING_CONFIRMATION') return
  if(pObj?.msg2send) return pObj.msg2send
  if(pObj?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj?.allyCode)
    return;
  }
  if(!pObj?.data) return { content: 'Error getting playerData' }

  let territoryTournamentEventStatus = pObj.data?.territoryTournamentEventStatus
  if(!territoryTournamentEventStatus || territoryTournamentEventStatus?.length == 0) return { content: 'There is not a GA in progress' }

  let eventIndex = +territoryTournamentEventStatus.length - 1
  let data = territoryTournamentEventStatus[eventIndex]
  let res = await fetch(allyCode, data)
  if(!res?.url) return { content: 'error processing request...' }

  let embedMsg = {
    color: 15844367,
    title: `GA Planning Weblink`,
    timestamp: new Date(pObj.updated),
    description: `${res.url}`,
    fields: [],
    footer: {
      text: "GA Planning site maintained by Quig"
    }
  }
  return { embeds: [embedMsg] }
}
