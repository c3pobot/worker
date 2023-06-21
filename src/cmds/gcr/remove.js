'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let id, msg2send = {content: 'You did not provide the correct information'}
    if(opt.find(x=>x.name == 'id')) id = opt.find(x=>x.name == 'id').value
    if(id >= 0){
      msg2send.content = 'ID **'+id+'** is not for a global custom reaction'
      const lCR = (await mongo.find('reactions', {_id: 'global'}))[0]
      if(lCR && lCR.cr && lCR.cr.filter(x=>x.id == id)){
        await mongo.pull('reactions', {_id: 'global'}, {cr:{id: id}})
        msg2send.content = 'Global custom reaction with ID **'+id+'** and trigger **'+lCR.cr.find(x=>x.id == id).trigger+'** has been deleted for this server'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
