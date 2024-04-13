'use strict'
module.exports = async(obj, shard, opt = [])=>{
  try{
    let msg2send = {content: 'You did not provide and settings to change'}
    if(opt.length > 0){
      msg2send.content = ''
      if(opt.find(x=>x.name == 'sort')){
        mongo.set('payoutServers', {_id: shard._id}, {rankSort: opt.find(x=>x.name == 'sort').value})
        msg2send.content += 'Rank report sort has been set to '+opt.find(x=>x.name == 'sort').value+'\n'
      }
      if(opt.find(x=>x.name == 'limit')){
        await mongo.set('payoutServers', {_id: shard._id}, {rankLimit: opt.find(x=>x.name == 'limit').value})
        msg2send.content += 'Rank report has been set to only show players with rank at or below **'+opt.find(x=>x.name == 'limit').value+'**\n'
      }
      if(opt.find(x=>x.name == 'leader')){
        await mongo.set('payoutServers', {_id: shard._id}, {rankLeader: opt.find(x=>x.name == 'leader').value})
        msg2send.content += 'Rank report has been set to '+(opt.find(x=>x.name == 'leader').value ? 'show':'not show')+' squad leader\n'
      }
      if(opt.find(x=>x.name == 'truncate')){
        await mongo.set('payoutServers', {_id: shard._id}, {truncateRankLeader: opt.find(x=>x.name == 'truncate').value})
        msg2send.content += 'Rank report has been set to '+(opt.find(x=>x.name == 'truncate').value ? 'shorten':'not shorten')+' squad leader name\n'
      }
      if(msg2send.content == '') msg2send.content = 'There was an error with the provided information'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
