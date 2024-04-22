'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const { addPlayer } = require('./helper')
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
const { getOptValue, checkShardAdmin, getDiscordAC, replyButton } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let auth = +shard.allowAll || 0, msg2send = {content: 'Adding players requires admin permissions'}, loginConfirm, lb
  if(!auth) auth = await checkShardAdmin(obj, shard)
  if(!auth) return msg2send
  if(obj?.confirm?.response) loginConfirm = obj.confirm.response
  let emoji = getOptValue(opt, 'emoji')
  msg2send.content = 'You do not have google or fb linked to you discordId'
  let dObj = await getDiscordAC(obj.member.user.id)
  if(dObj?.uId && dObj?.type){
    msg2send.content = 'Could not get leaderboard info'
    lb = await swgohClient.oauth(obj, 'getLeaderboard', dObj, {leaderboardType: 2, combatType: (shard.type == 'char' ? 1:2)}, loginConfirm)
    if(lb === 'GETTING_CONFIRMATION') return
    if(lb?.error == 'invalid_grant'){
      await replyTokenError(obj, dObj.allyCode)
      return;
    }
    if(lb?.msg2send) return { content: lb.msg2send }
  }
  if(lb?.data){
    msg2send.content = 'No new players where added'
    await replyButton(obj, 'Attempting to import **'+lb.data.player.length+'** players. Please wait')
    let count = 0, pCount = 0
    msg2send.embeds = []
    let embedMsg = {
      color: 15844367,
      description: 'Rank'+(emoji ? ' : emoji':'')+' : Name\n```\n'
    }
    for(let i in lb.data.player){
      let status = await importPlayer(shard, lb.data.player[i], emoji)
      if(status?.name){
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
    }
    if(count > 0 && msg2send.embeds.length > 0){
      msg2send.content = null
      msg2send.embeds[0].title = 'New players added to shard ('+count+')'
    }else{
      delete msg2send.embeds
    }
  }
  return msg2send
}
