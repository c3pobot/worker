'use strict'
const DeleteCachedPlayer = async(pId, count)=>{
  const obj = (await mongo.find('shardRankCache', {_id: pId}))[0]
  if(obj){
    if(debugMsg) console.log(pId+' exists')
    await mongo.del('shardRankCache', {_id: pId})
  }else{
    if(debugMsg) console.log(pId+' is deleted')
  }
  count--
  if(count > 0) setTimeout(()=>DeleteCachedPlayer(pId, count), 10000)
}
module.exports = async(obj, shard, opt)=>{
  try{
    let msg2send = {content: 'This command requires shard admin privileges'}, startRank, emoji, cmdConfirm
    const auth = await HP.CheckShardAdmin(obj, shard)
    if(opt.find(x=>x.name == 'rank')) startRank = opt.find(x=>x.name == 'rank').value
    if(opt.find(x=>x.name == 'emoji')) emoji = opt.find(x=>x.name == 'emoji').value
    if(obj.confirm && obj.confirm.response) cmdConfirm = obj.confirm.response
    if(auth){
      msg2send.content = 'you did not provide the correct information'
      if(startRank){
        if(cmdConfirm){
          if(cmdConfirm == 'yes'){
            await HP.ReplyButton(obj, 'Pruning shard players at rank **'+startRank+'** and higher...')
            msg2send.content = 'Shard players at rank **'+startRank+'** and higher '+(emoji ? 'with emoji '+emoji:'')+' have been removed from the list'
            let players = await mongo.find('shardRankCache', {shardId: shard._id})
            if(players && players.length > 0){
              players = players.filter(x=>x.rank >= startRank)
              if(emoji) players = players.filter(x=>x.emoji == emoji)
              for(let i in players){
                await mongo.del('shardRankCache', {_id: players[i]._id})
                await mongo.del('shardPlayers', {_id: players[i]._id})
                DeleteCachedPlayer(players[i]._id, 10)
              }
            }
          }else{
            msg2send.content = 'Command Canceled'
            msg2send.components = []
          }
        }else{
          await HP.ConfirmButton(obj, 'Are you sure you want to remove players '+(emoji ? 'with emoji '+emoji:'')+' at rank **'+startRank+'** and higher?')
        }
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
