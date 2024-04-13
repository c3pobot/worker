'use strict'
const ShowWatch = require('./show')
module.exports = async(obj, shard, opt)=>{
  try{
    let allyCode, roleId, msg2send = {content: 'You did not provide the correct information'}
    if(opt && opt.find(x=>x.name == 'allycode')) allyCode = opt.find(x=>x.name == 'allycode').value.replace(/-/g, '')
    if(opt && opt.find(x=>x.name == 'role')) roleId = opt.find(x=>x.name == 'role').value
    if(allyCode && roleId){
      let tempWatch = {
        allyCode: +allyCode,
        chId: shard.logChannel,
        startTime: 24,
        moveDir: 'both'
      }
      if(shard.watch && shard.watch[allyCode]) tempWatch = shard.watch[allyCode]
      tempWatch.roleId = roleId
      if(opt.find(x=>x.name == 'channel')) tempWatch.chId = opt.find(x=>x.name == 'channel').value
      if(opt.find(x=>x.name == 'hours') && opt.find(x=>x.name == 'hours').value > 0) tempWatch.startTime = opt.find(x=>x.name == 'hours').value
      if(opt.find(x=>x.name == 'rank') && opt.find(x=>x.name == 'rank').value > 0) tempWatch.startRank = opt.find(x=>x.name == 'rank').value
      if(opt.find(x=>x.name == 'direction')) tempWatch.moveDir = opt.find(x=>x.name == 'direction').value
      await mongo.set('payoutServers', {_id: shard._id}, {['watch.'+allyCode]: tempWatch})
      const tempShard = (await mongo.find('payoutServers', {_id: shard._id}))[0]
      msg2send.content = 'Role watch updated'
      if(tempShard) ShowWatch(obj, tempShard, [{name: 'allycode', value: allyCode}])
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
