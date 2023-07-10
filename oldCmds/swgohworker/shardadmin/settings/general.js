'use strict'
module.exports = async(obj, shard, opt = [])=>{
  try{
    let msg2send = {content: 'You did not provide and settings to change'}
    if(opt.length > 0){
      msg2send.content = ''
      if(opt.find(x=>x.name == 'admin-add')){
        const addRole = obj.data.resolved.roles[opt.find(x=>x.name == 'admin-add').value]
        if(addRole){
          if(!shard.admin || (shard.admin && !shard.admin[addRole.id])){
            await mongo.set('payoutServers', {_id: shard._id}, {['admin.'+addRole.id]: {id: addRole.id, name: addRole.name}})
            msg2send.content += '@'+addRole.name+' was added as shard admin role\n'
          }else{
            msg2send.content += '@'+addRole.name+' is already a shard admin role\n'
          }
        }
      }
      if(opt.find(x=>x.name == 'admin-remove')){
        if(shard.admin && shard.admin[opt.find(x=>x.name == 'admin-remove').value]){
          const rmvRole = shard.admin[opt.find(x=>x.name == 'admin-remove').value]
          await mongo.unset('payoutServers', {_id: shard._id}, {['admin.'+rmvRole.id]: rmvRole})
          msg2send.content += '@'+rmvRole.name+' was removed as a shard admin role\n'
        }else{
          msg2send.content += 'The provide role was not removed as it is not a shard admin role\n'
        }
      }
      if(opt.find(x=>x.name == 'message')){
        console.log(opt.find(x=>x.name == 'message').value)
        let newMessage = opt.find(x=>x.name == 'message').value
        if(newMessage.toLowerCase() == 'default') newMessage = 'default'
        await mongo.set('payoutServers', {_id: shard._id}, {message: newMessage})
        msg2send.content += 'report messages has been updated\n'
      }
      if(opt.find(x=>x.name == 'modify')){
        await mongo.set('payoutServers', {_id: shard._id}, {allowAll: opt.find(x=>x.name == 'modify').value})
        msg2send.content += 'Add/Edit has been '+(opt.find(x=>x.name == 'modify').value ? 'enabled':'disabled')+' for all users\n'
      }
      if(msg2send.content == '') msg2send.content = 'There was an error with the provided information'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
