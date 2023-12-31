'use strict'
const { mongo, GetOptValue, ReplyMsg } = require('helpers')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'That is not a personal custom reaction'}, tempObj
    let id = GetOptValue(opt, 'id')
    let trigger = GetOptValue(opt, 'trigger')
    if(trigger) trigger = trigger.toString().trim().toLowerCase()
    let response = GetOptValue(opt, 'response')
    let crca = GetOptValue(opt, 'anywhere')
    const lCR = (await mongo.find('reactions', {_id: obj.member.user.id}))[0]
    if(lCR && lCR.cr && lCR.cr.find(x=>x.id == id)) tempObj = Object.assign({}, lCR.cr.find(x=>x.id == id))
    if(tempObj){
      if(trigger && lCR.cr.filter(x=>x.trigger == trigger && x.id != id).length > 0){
        msg2send.content = 'There is already another reaction for **'+trigger+'**'
      }else{
        if(trigger) tempObj.trigger = trigger
        if(response) tempObj.response = response
        if(crca >= 0) tempObj.anywhere = crca
        await mongo.set('reactions', {_id: obj.member.user.id, 'cr.id': id}, {'cr.$': tempObj})
        const embedMsg = {
          color: 15844367,
          title: 'Personal Custom Reaction',
          description: '**Custom Reaction Updated**\n#'+id+'\n\n**Trigger** : \n'+tempObj.trigger+'\n\n**Response** : \n'+tempObj.response+'\n\n'
        }
        embedMsg.description += 'Trigger anywhere : \n'+(tempObj.anywhere > 0 ? 'Yes':'No')
        msg2send.embeds = [embedMsg]
        msg2send.content = null
      }
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
