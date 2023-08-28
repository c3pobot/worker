'use strict'
const mongo = require('mongoclient')
const { GetOptValue, ButtonPick, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  try{
    let allyCode, msg2send = {content: 'You did not provide the correct information'}, count = 0
    if(patreon.users) count += +patreon.users.length
    if(patreon.guilds) count += +patreon.guilds.length * 50
    if(obj.confirm && obj.confirm.allyCode) allyCode = +obj.confirm.allyCode
    if(!allyCode) allyCode = GetOptValue(opt, 'allycode')
    if(allyCode) allyCode = allyCode.replace(/-/g, '').trim()
    let newUser = GetOptValue(opt, 'user')
    if(count >= patreon.maxAllyCodes){
      await ReplyMsg(obj, { content: 'You are only allowed to register **'+patreon.maxAllyCodes+'** and you already have **'+count+'**.\nNote a guild counts as 50' })
      return
    }
    if(newUser && !allyCode){
      let dObj = (await mongo.find('discordId', {_id: newUser}))[0]
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
            content: 'There are multiple allyCodes for '+(usrname ? '**@'+usrname+'**':'that user')+'. Which one do you want to add?',
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
          return
        }
      }
    }
    if(allyCode){
      msg2send.content = 'Error getting player info for **'+allyCode+'**'
      if(patreon.users && patreon.users.filter(x=>x.allyCode == +allyCode).length > 0){
        msg2send.content = 'That user is already in your list'
      }else{
        let pObj = await swgohClient('queryArenaPlayer', { allyCode: allyCode.toString()})
        if(pObj){
          await mongo.push('patreon', {_id: patreon._id}, {users: {allyCode: +allyCode, name: pObj.name}})
          msg2send.content = '**'+pObj.name+'** with **'+allyCode+'** was added to your list'
        }
      }
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
