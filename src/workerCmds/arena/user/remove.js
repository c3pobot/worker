'use strict'
const { mongo, ButtonPick, GetOptValue, GetMentionUserName, ReplyButton, ReplyMsg } = require('helpers')
module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You did not provide the correct information'}
    let allyCode = GetOptValue(opt, 'allycode')?.replace(/-/g)
    if(obj.confirm){
      allyCode = +obj.confirm.allyCode
      await ReplyButton(obj)
    }
    let newUser = GetOptValue(opt, 'user')
    if(!allyCode && newUser){
      let dObj = (await mongo.find('discordId', {_id: newUser}))[0]
      msg2send.content = 'That user does not have allyCode linked to discordId'
      if(dObj?.allyCodes?.length > 0){
        if(dObj.allyCodes.length === 1){
          allyCode = dObj.allyCodes[0].allyCode
        }else{
          let usrname = GetMentionUserName(obj, newUser)
          const embedMsg = {
            content: 'There are multiple allyCodes for '+(usrname ? '**@'+usrname+'**':'that user')+'. Which one do you want to remove?',
            components: [],
            flags: 64
          }
          let x = 0
          for(let i in dObj.allyCodes){
            if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
            embedMsg.components[x].components.push({
              type: 2,
              label: dObj.allyCodes[i].name+' ('+dObj.allyCodes[i].allyCode+')',
              style: 1,
              custom_id: JSON.stringify({id: obj.id, allyCode: dObj.allyCodes[i].allyCode})
            })
            if(embedMsg.components[x].components.length == 5) x++;
          }
          await ButtonPick(obj, embedMsg)
          return
        }
      }
    }
    if(allyCode){
      msg2send.content = '**'+allyCode+'** is not in your user list'
      if(patreon.users && patreon.users.filter(x=>x.allyCode == +allyCode).length > 0){
        let tempUser = patreon.users.find(x=>x.allyCode == +allyCode)
        await mongo.pull('patreon', {_id: patreon._id}, {users:{allyCode: +allyCode}})
        msg2send.content = '**'+tempUser.name+'** was removed from your list'
      }
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
