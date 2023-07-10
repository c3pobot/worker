'use strict'
module.exports = async(obj, patreon, opt)=>{
  try{
    let allyCode, msg2send = {content: 'You did not provide the correct information'}
    if(obj.confirm && obj.confirm.allyCode) allyCode = +obj.confirm.allyCode
    if(!allyCode && opt){
      if(opt.find(x=>x.name == 'user')){
        const dObj = (await mongo.find('discordId', {_id: opt.find(x=>x.name == 'user').value}))[0]
        if(dObj && dObj.allyCodes && dObj.allyCodes.length > 0){
          if(dObj.allyCodes.length == 1){
            if(dObj.allyCodes[0].allyCode) allyCode = dObj.allyCodes[0].allyCode
          }else{
            let usrname
            if(obj.data.resolved && obj.data.resolved.members && obj.data.resolved.members[opt.find(x=>x.name == 'user').value] && obj.data.resolved.members[opt.find(x=>x.name == 'user').value].nick){
              usrname = obj.data.resolved.members[opt.find(x=>x.name == 'user').value].nick
            }else{
              usrname = obj.data.resolved.users[opt.find(x=>x.name == 'user').value].username
            }
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
            await HP.ButtonPick(obj, embedMsg)
          }
        }else{
          msg2send.content = 'That user does not have allyCode linked to discordId'
        }
      }else{
        if(opt.find(x=>x.name == 'allycode')) allyCode = opt.find(x=>x.name == 'allycode').value.trim().replace(/-/g, '')
      }
    }
    if(allyCode){
      msg2send.content = '**'+allyCode+'** is not in your user list'
      if(patreon.users && patreon.users.filter(x=>x.allyCode == +allyCode).length > 0){
        const tempUser = patreon.users.find(x=>x.allyCode == +allyCode)
        await mongo.pull('patreon', {_id: patreon._id}, {users:{allyCode: +allyCode}})
        msg2send.content = '**'+tempUser.name+'** was removed from your list'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
