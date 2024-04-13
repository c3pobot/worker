'use strict'
const { AddPlayer } = require('./helper')
const ImportPlayer = async(shard, obj, emoji = null)=>{
  try{
    let count
    const exists = (await mongo.find('shardPlayers', {shardId: shard._id, playerId: obj.id}))[0]
    if(!exists){
      const pObj = await Client.post('getArenaPlayer', {playerId: obj.id}, null)
      if(pObj && pObj.allyCode){
        count = {
          name: pObj.name,
          allyCode: pObj.allyCode,
          rank: (pObj.arena[shard.type] ? +pObj.arena[shard.type].rank:0)
        };
        await AddPlayer(shard, pObj, emoji)
      }
    }
    return count
  }catch(e){
    console.log(e)
  }
}
module.exports = async(obj, shard, opt = [])=>{
  try{
    let auth = +shard.allowAll || 0, msg2send = {content: 'Adding players requires admin permissions'}, loginConfirm, dObj, lb
    if(obj?.confirm?.response) loginConfirm = obj.confirm.response
    let emoji = HP.GetOptValue(opt, 'emoji')
    if(!auth) auth = await HP.CheckShardAdmin(obj, shard)
    if(auth){
      msg2send.content = 'You do not have google or fb linked to you discordId'
      dObj = await HP.GetDiscordAC(obj.member.user.id)
    }
    if(dObj?.uId && dObj?.type){
      msg2send.content = 'Could not get leaderboard info'
      await HP.ReplyButton(obj, 'Pulling leaderboard data...')
      lb = await Client.oauth(obj, 'getLeaderboard', dObj, {leaderboardType: 2, combatType: (shard.type == 'char' ? 1:2)}, loginConfirm)
    }
    if(lb?.data){
      msg2send.content = 'No new players where added'
      await HP.ReplyButton(obj, 'Attempting to import **'+lb.data.player.length+'** players. Please wait')
      let count = 0, pCount = 0
      msg2send.embeds = []
      let embedMsg = {
        color: 15844367,
        description: 'Rank'+(emoji ? ' : emoji':'')+' : Name\n```\n'
      }
      for(let i in lb.data.player){
        const status = await ImportPlayer(shard, lb.data.player[i], emoji)
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
    HP.ResponseMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
