'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const swgohClient = require('src/swgohClient')

const { getDiscordAC, replyTokenError } = require('src/helpers')
const getArenaPlayers = require('../helpers/getArenaPlayers')
module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.response == 'no') return { content: 'command canceled...'}

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId || !dObj?.type) return { content: 'this command requires google or code auth linked' }

  let lb = await swgohClient.oauth(obj, 'getLeaderboard', dObj, { leaderboardType: 2, combatType: 1 })
  if(lb == 'GETTING_CONFIRMATION') return
  if(lb?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  if(lb?.msg2send) return lb.msg2send

  if(!lb.data?.player) return { content: 'Error getting leaderboard...' }

  let players = await getArenaPlayers(lb.data.player)
  players = sorter([{column: 'rank', order: 'ascending' }], players || [])
  if(!players || players?.length === 0) return { content: 'Error getting allyCodes...' }

  let embedMsg = { color: 15844367, description: `Squad Arena Leaderboard (${players.length})`, timestamp: new Date() }
  embedMsg.description += '```\nRank : allyCode  : Name\n'
  for(let i in players) embedMsg.description += `${players[i].rank?.toString()?.padStart(2, '0')}   : ${players[i].allyCode} : ${players[i].name}\n`
  embedMsg.description += '```'
  return { content: null, embeds: [embedMsg] }
}
