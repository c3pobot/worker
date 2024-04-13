'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let schedule, msg2send = {content: 'that player is not part of the rot schedule'}, playerName
    if(opt && opt.find(x=>x.name == 'schedule')) schedule = opt.find(x=>x.name == 'schedule').value.toUpperCase()
    const rots = (await mongo.find('shardRotations', {_id: shard._id}))[0]
    if(schedule && rots && rots[schedule] && rots[schedule].players.length > 0){
      if(opt.find(x=>x.name == 'player')){
        if(opt.find(x=>x.name == 'player').value.replace(/-/g, '') > 999999 || opt.find(x=>x.name == 'player').value.startsWith('<@')){
          if(opt.find(x=>x.name == 'player').value.replace(/-/g, '') > 999999){
            const pObj = (await mongo.find('shardRankCache', {_id: opt.find(x=>x.name == 'player').value.replace(/-/g, '')+'-'+shard._id}))[0]
            if(pObj && pObj.name) playerName = pObj.name
          }
          if(opt.find(x=>x.name == 'player').value.startsWith('<@')){
            const dId = opt.find(x=>x.name == 'player').value.replace(/[<@!>]/g, '')
            if(dId){
              if(rots[schedule].players.filter(x=>x.discord.replace(/[<@!>]/g, '') == dId).length > 0){
                playerName = rots[schedule].players.filter(x=>x.discord.replace(/[<@!>]/g, '') == dId)[0].name
              }
            }
          }
        }else{
          playerName = opt.find(x=>x.name == 'player').value
        }
        if(playerName && rots[schedule].players.filter(x=>x.name == playerName).length > 0){
          const rmvPlayer = Object.assign({}, rots[schedule].players.find(x=>x.name == playerName))
          await mongo.pull('shardRotations', {_id: shard._id}, {[schedule+'.players']: rmvPlayer})
          msg2send.content = '**'+rmvPlayer.name+'** was removed from **'+schedule+'** rotation'
        }
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
