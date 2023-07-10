'use strict'
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'You did not provide the correct information'}
    if(opt && opt.find(x=>x.name == 'user')){
      msg2send.content = 'Could not find that patreon'
      const patreon = (await mongo.find('patreon', {_id: opt.find(x=>x.name == 'user').value}))[0]
      if(patreon){
        await mongo.del('patreon', {_id: patreon._id})
        msg2send.content = 'patreon removed'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
