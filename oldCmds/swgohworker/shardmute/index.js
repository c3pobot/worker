'use strict'
module.exports = async(obj = {})=>{
  try{
    let shardType, opt = [], msg2send = {content: 'You must provide a shard type'}
    if(obj.data && obj.data.options && obj.data.options.length > 0) opt = obj.data.options
    if(opt.find(x=>x.name == 'type')) shardType = opt.find(x=>x.name == 'type').value
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(shardType){
      const shardPlayer = await mongo.find('shardPlayers', {dId: obj.member.user.id, type: shardType})
      if(shardPlayer && shardPlayer.length > 0){
        for(let i in shardPlayer){
          await mongo.set('shardPlayers', {_id: shardPlayer[i]._id}, {'notify.status': 0})
        }
      }
      if(dObj && dObj.allyCode){
        const dPlayer = await mongo.find('shardPlayers', {allyCode: +dObj.allyCode, type: shardType})
        if(dPlayer && dPlayer.length > 0){
          for(let i in dPlayer){
            await mongo.set('shardPlayers', {_id: dPlayer[i]._id}, {'notify.status': 0})
          }
        }
      }
      msg2send.content = 'All notifications for **'+shardType+'** area shard tracker have been disabled. They can only be reenabled in the shard chat'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
