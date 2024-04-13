'use strict'
const { AddPlayer } = require('./helper')
module.exports = async(obj, shard, opt)=>{
  try{
    let auth = +shard.allowAll || 0, allyCode, msg2send = {content: 'there was an error with the provided data'}
    if(obj && obj.member && obj.member && obj.member.user && obj.member.user.id){
      msg2send.content = 'You did not provide a valid allyCode'
      if(opt && opt.find(x=>x.name == 'allycode')) allyCode = opt.find(x=>x.name == 'allycode').value.replace(/-/g, '').toString()
      if(allyCode && allyCode > 999999){
        msg2send.content = 'Player with allyCode **'+allyCode+'** is not part of the shard list'
        let shardPlayer = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
        if(!shardPlayer){
          if(!auth) auth = await HP.CheckShardAdmin(obj, shard)
          if(auth){
            const pObj = await Client.post('getArenaPlayer', {allyCode: allyCode}, null)
            if(pObj && pObj.allyCode) await AddPlayer(shard, pObj, null)
            shardPlayer = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
          }
        }
        if(shardPlayer){
          await mongo.set('shardPlayers', {_id: allyCode+'-'+shard._id}, {dId: obj.member.user.id})
          msg2send.content = 'allyCode '+allyCode+' has been linked to your discord id for shard notifications'
        }
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
