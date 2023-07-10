'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let allyCode, dId = obj.member.user.id, pObj, msg2send = {content: 'shard member not found'}
    if(opt && opt.find(x=>x.name == 'user')) dId = opt.find(x=>x.name == 'user').value
    if(opt && opt.find(x=>x.name == 'allycode')) allyCode = opt.find(x=>x.name == 'allycode').value.replace(/-/g, '').toString()
    if(allyCode) pObj = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
    if(!allyCode && !pObj) pObj = (await mongo.find('shardPlayers', {dId: dId, shardId: shard._id}))[0]
    if(pObj){
      msg2send.content = 'No player rank cache'
      const rankCache = (await mongo.find('shardRankCache', {_id: pObj._id}))[0]
      if(rankCache){
        const watchObj = await mongo.find('shardWatch', {pId: pObj.allyCode+'-'+shard._id})
        const embedMsg = {
          color: 15844367,
          title: pObj.name+'\'s '+HP.GetShardName(shard)+' Arena Info',
          description: '```',
          timestamp: new Date()
        }
        embedMsg.description += 'allyCode         : '+pObj.allyCode
        if(pObj.emoji) embedMsg.description += '\nEmoji            : '+pObj.emoji
        if(rankCache) embedMsg.description += '\nSquad Arena Rank : '+(rankCache.arena ? rankCache.arena.char.rank : 0);
        embedMsg.description += '\nSquad Arena PO   : '+HP.TimeTillPayout(pObj.poOffSet, 'char')[0]
        if(rankCache) embedMsg.description += '\nFleet Arena Rank : '+(rankCache.arena ? rankCache.arena.ship.rank : 0)
        embedMsg.description += '\nFleet Arena PO   : '+HP.TimeTillPayout(pObj.poOffSet, 'ship')[0]
        if(pObj.notify.status > 0){
          embedMsg.description += '\nNotifications    : '+pObj.notify.method
          embedMsg.description += '\nNotif Start      : '+pObj.notify.startTime
          embedMsg.description += '\nPayout Notif     : '+(pObj.notify.poMsg > 0 ? 'on' : 'off')
          embedMsg.description += '\nAlt Arena Notif  : '+(pObj.notify.altStatus > 0 ? 'on' : 'off')
        }else{
          embedMsg.description += '\nNotifications    : off'
        }
        embedMsg.description += '```'
        if(watchObj && watchObj.length > 0){
          embedMsg.description += 'Active Rank watches\n```\n'
          for(let i in watchObj) embedMsg.description += watchObj[i].rank+'\n'
          embedMsg.description += '```'
        }
        msg2send.content = null
        msg2send.embeds = [embedMsg]
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
