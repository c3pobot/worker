'use strict'
module.exports = async(obj, shard, opt = [])=>{
  try{
    let msg2send = {content: 'You did not provide and settings to change'}
    if(opt.length > 0){
      msg2send.content = ''
      if(opt.find(x=>x.name == 'sort')){
        await mongo.set('payoutServers', {_id: shard._id}, {poSort: opt.find(x=>x.name == 'sort').value})
        msg2send.content += 'Payout report sort has been set to '+opt.find(x=>x.name == 'sort').value+'\n'
      }
      if(opt.find(x=>x.name == 'group-sort')){
        await mongo.set('payoutServers', {_id: shard._id}, {sort: opt.find(x=>x.name == 'group-sort').value})
        msg2send.content += 'Payout groups have been set to sort by '+opt.find(x=>x.name == 'group-sort').value+'\n'
      }
      if(opt.find(x=>x.name == 'limit')){
        await mongo.set('payoutServers', {_id: shard._id}, {poLimit: opt.find(x=>x.name == 'limit').value})
        msg2send.content += 'Payout report has been set to only show players with rank at or below **'+opt.find(x=>x.name == 'limit').value+'**\n'
      }
      if(msg2send.content == '') msg2send.content = 'There was an error with the provided information'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
