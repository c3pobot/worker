'use strict'
const Cmds = {}
Cmds.AddPlayer = async(shard, pObj, emoji = null)=>{
  try{
    const tempObj = {
      allyCode: +pObj.allyCode,
      shardId: shard._id,
      alt: shard.alt,
      emoji: emoji,
      name: pObj.name,
      notify: {
        status: 0,
        method: 'log',
        startTime: 24,
        poMsg: 0,
        altStatus: 0
      },
      playerId: pObj.playerId,
      poOffSet: pObj.poOffSet,
      type: shard.type
    }
    await mongo.set('shardPlayers', {_id: pObj.allyCode+'-'+shard._id}, tempObj)
  }catch(e){
    console.log(e)
  }
}
Cmds.ShowNotifyStatus = async(shard, pId)=>{
  try{
    const pObj = (await mongo.find('shardPlayers', {_id: pId}))[0]
    const watch = await mongo.find('shardWatch', {pId: pId})
    if(pObj && pObj.notify){
      const embedMsg = {
        color: 15844367,
        title: pObj.name+' '+(shard.type == 'char' ? 'Squad':'Fleet')+' Arena Shard notification status',
        description: '```\n',
        timestamp: new Date()
      }
      embedMsg.description += 'Notifications : '+(pObj.notify.status > 0 ? 'on':'off')+'\n'
      embedMsg.description += 'Method        : '+pObj.notify.method+'\n'
      embedMsg.description += 'Start         : '+pObj.notify.startTime+'\n'
      embedMsg.description += 'PO Notify     : '+(pObj.notify.poMsg > 0 ? 'on':'off')+'\n'
      embedMsg.description += (shard.alt == 'char' ? 'Squad':'Fleet')+'         : '+(pObj.notify.altStatus > 0 ? 'on':'off')+'\n'
      embedMsg.description += '```'
      if(watch.length > 0){
        embedMsg.description += (shard.type == 'char' ? 'Squad':'Fleet')+' Rank Watches Active\n'
        embedMsg.description += '```\n'
        for(let i in watch) embedMsg.description += watch[i].rank+'\n'
        embedMsg.description += '```'
      }
      return embedMsg
    }
  }catch(e){
    console.log(e)
  }
}
module.exports = Cmds
