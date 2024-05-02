'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')

const { addPlayer } = require('./helper')
const { checkShardAdmin, getDiscordAC, replyButton } = require('src/helpers')

const importPlayer = async(shard = {}, obj = {}, emoji = null)=>{
  let count
  let exists = (await mongo.find('shardPlayers', {shardId: shard._id, playerId: obj.id}))[0]
  if(!exists){
    let pObj = await swgohClient.post('getArenaPlayer', {playerId: obj.id}, null)
    if(pObj?.allyCode){
      count = {
        name: pObj.name,
        allyCode: pObj.allyCode,
        rank: (pObj.arena[shard.type] ? +pObj.arena[shard.type].rank:0)
      };
      await addPlayer(shard, pObj, emoji)
    }
  }
  return count
}

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  if(obj.confirm?.response == 'no') return { content: 'command canceled...'}

  let auth = +shard.allowAll || 0
  if(!auth) auth = await checkShardAdmin(obj, shard)
  if(!auth) return { content: 'Adding players requires admin permissions' }

  let emoji = opt.emoji?.value
  msg2send.content = 'You do not have google or fb linked to you discordId'
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId || !dObj?.type) return { content: 'this command requires google or code auth linked' }

  let lb = await swgohClient.oauth(obj, 'getLeaderboard', dObj, { leaderboardType: 2, combatType: (shard.type == 'char' ? 1:2) })
  if(lb?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  if(lb?.msg2send) return lb.msg2send

  let msg2send = { content: 'No new players where added', embeds: [] }
  let count = 0, pCount = 0, embedMsg = {
    color: 15844367,
    description: 'Rank'+(emoji ? ' : emoji':'')+' : Name\n```\n'
  }
  for(let i in lb.data.player){
    let status = await importPlayer(shard, lb.data.player[i], emoji)
    if(!status?.name) continue
    count++;
    pCount++;
    embedMsg.description += status.rank.toString().padStart(2, '0')+' '+(emoji ? ': '+emoji+'':'')+' : '+status.name+'\n'
    if(pCount != 25 && pCount > 0 && +i == +(lb.data.player.length - 1 )) pCount = 25
    if(pCount === 25){
      embedMsg.description += '```'
      msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
      embedMsg = {
        color: 15844367,
        description: 'Rank'+(emoji ? ' : emoji':'')+' : Name\n```\n'
      }
    }
  }
  if(count > 0 && msg2send.embeds.length > 0){
    msg2send.content = null
    msg2send.embeds[0].title = 'New players added to shard ('+count+')'
  }else{
    delete msg2send.embeds
  }
  return msg2send
}
