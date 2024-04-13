'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let msg2send = {content: 'Enemy group watch is not configured'}
    if(shard && shard.enemyWatch){
      const guild = await MSG.GetGuild(shard.sId)
      const embedMsg = {
        color: 15844367,
        description: (guild ? guild.name+' ':'')+'Enemy Watch info\n'
      }
      embedMsg.description += 'Status  : '+(shard.enemyWatch.notify > 0 ? '`enabled`':'`disabled`')+'\n'
      embedMsg.description += 'Channel : <#'+shard.enemyWatch.chId+'>\n'
      if(shard.enemyWatch.roleId){
        const role = await HP.GetRole(shard.sId, shard.enemyWatch.roleId)
        embedMsg.description += 'Role\n```\n'
        embedMsg.description += '@'+(role ? role.name:'UNKNOWN')+'\n```\n'
      }
      embedMsg.description += 'Starting Rank\n```\n'+shard.enemyWatch.startRank+' '+(shard.enemyWatch.status == 'once' ? 'one time message':'for all climbs')+'\n```\n'
      if(shard.enemyWatch.emoji.length > 0){
        embedMsg.description += 'Emoji\n```\n'
        for(let i in shard.enemyWatch.emoji) embedMsg.description += shard.enemyWatch.emoji[i]+' ';
        embedMsg.description += '\n```\n'
      }
      if(shard.enemyWatch.allyCodes.length > 0){
        embedMsg.description += 'Players ('+shard.enemyWatch.allyCodes.length+')\n```\n'
        for(let i in shard.enemyWatch.allyCodes){
          const pObj = (await mongo.find('shardPlayers', {_id: shard.enemyWatch.allyCodes[i]+'-'+shard._id}))[0]
          embedMsg.description += shard.enemyWatch.allyCodes[i]+' : '+(pObj ? pObj.name:'UNKNOWN')+'\n'
        }
        embedMsg.description += '```\n'
      }
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
