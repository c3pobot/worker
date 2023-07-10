'use strict'
module.exports = async(obj, shard, opt = [])=>{
  try{
    let msg2send = {content: 'Error with provided info'}, unit, uInfo, alias, confirmRemove
    if(obj.confirm && obj.confirm.response) confirmRemove = obj.confirm.response
    if(opt.find(x=>x.name == 'alias')) alias = opt.find(x=>x.name == 'alias').value.trim()
    if(alias){
      msg2send.content = '**'+alias+'** is not a squad lead alias for this server'
      if(shard && shard.alias && shard.alias.filter(x=>x.alias == alias).length > 0 && !confirmRemove){
        await HP.ConfirmButton(obj, 'Are your sure you want to remove alias **'+alias+'** as a squad lead alias for **'+shard.alias.filter(x=>x.alias == alias)[0].nameKey+'**?')
      }
    }
    if(confirmRemove){
      msg2send.content = 'Command Canceled'
      if(confirmRemove == 'yes'){
        await mongo.pull('payoutServers', {_id: shard._id}, {alias: {alias: alias}})
        msg2send.content = '**'+alias+'** was removed as a squad lead alias for this server'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
  }
}
