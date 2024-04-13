'use strict'
module.exports = async(obj, shard, opt = [])=>{
  try{
    let msg2send = {content: 'Error with provided info'}, unit, uInfo, alias
    if(opt.find(x=>x.name == 'alias')) alias = opt.find(x=>x.name == 'alias').value.trim()
    if(alias){
      msg2send.content = 'There is already an alias **'+alias+'** for this server'
      if(shard && ((shard.alias && shard.alias.filter(x=>x.alias.toUpperCase() == alias.toUpperCase()).length == 0) || !shard.alias)){
        msg2send.content = 'You did not provide a unit to search'
        unit = HP.GetOptValue(opt, 'unit')
        if(unit) unit = unit.toString().trim()
      }
    }
    if(unit){
      msg2send.content = 'Error find unit **'+unit+'**'
      uInfo = await HP.FindUnit(obj, unit, null)
    }
    if(uInfo && uInfo.nameKey){
      await HP.ReplyButton(obj, 'Setting aliad for **'+uInfo.nameKey+'** ...')
      msg2send.content = '**'+alias+'** was added as an alias for **'+uInfo.nameKey+'**'
      if(shard && ((shard.alias && shard.alias.filter(x=>x.alias.toUpperCase() == alias.toUpperCase()).length == 0) || !shard.alias)){
        await mongo.push('payoutServers', {_id: shard._id}, {alias: {baseId: uInfo.baseId, alias: alias, nameKey: uInfo.nameKey}})
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
  }
}
