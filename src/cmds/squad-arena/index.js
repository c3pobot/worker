'use strict'
const swgohClient = require('src/swgohClient')
const sorter = require('json-array-sorter')
const { getDiscordAC, replyError, replyTokenError } = require('src/helpers')

const getPlayer = async(player = {})=>{
  if(!player.id) return
  let obj = await swgohClient.post('playerArena', { playerDetailsOnly: true, playerId: player.id })
  if(obj.allyCode) return { allyCode: obj.allyCode, rank: player?.pvpStatus?.rank, name: player.name }
}
const getPlayers = async(players = [])=>{
  if(players.length == 0) return
  let array = [], i = players.length
  while(i--) array.push(getPlayer(players[i]))
  let res = await Promise.allSettled(array)
  return res?.filter(x=>x?.value?.allyCode)?.map(x=>x.value)
}
module.exports = async(obj = {})=>{
  try{
    if(obj.confirm?.response == 'no') return { content: 'command canceled...'}

    let opt = obj.data?.options || {}

    let dObj = await getDiscordAC(obj.member.user.id, opt)
    if(!dObj?.uId || !dObj?.type) return { content: 'this command requires google or ea_connect auth linked' }

    let lb = await swgohClient.oauth(obj, 'getLeaderboard', dObj, { leaderboardType: 2, combatType: 1 })
    if(lb == 'GETTING_CONFIRMATION') return
    if(lb?.error == 'invalid_grant'){
      await replyTokenError(obj, dObj.allyCode)
      return;
    }
    if(lb?.msg2send) return lb.msg2send

    if(!lb?.data?.player || lb?.data?.player?.length == 0) return { content: 'Error getting leaderboard info...'}

    let players = await getPlayers(lb?.data?.player)
    if(!players || players?.length === 0) return { content: 'Error getting allyCodes...'}

    players = sorter([{column: 'rank', order: 'ascending'}], players)
    let embedMsg = { color: 15844367, title: 'Squad Arena Leaderboard top 50', description: '```\n' }
    for(let i in players) embedMsg.description += `${players[i]?.rank?.toString().padStart(2, "0")} : ${players[i].allyCode} : ${players[i].name}\n`
    embedMsg.description += '```'
    return { content: null, embeds: [embedMsg] }
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
