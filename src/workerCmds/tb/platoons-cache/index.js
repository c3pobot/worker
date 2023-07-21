'use strict'
const { mongo, ButtonPick, CheckGuildAdmin, GetGuildId, GetOptValue, ReplyButton, ReplyMsg} = require('helpers')
module.exports = async(obj ={}, opt = [])=>{
  try{
    let msg2send = {content: 'you do not have discord id linked to allyCode'}, gObj, round
    let tbId = GetOptValue(opt, 'tb-name', 't05D')
    if(obj.confirm){
      if(obj.confirm.round === 'cancel'){
        await ReplyMsg(obj, {content: 'Command canceled', components: null})
        return
      }
      await ReplyButton(obj)
      round = obj.confirm.round
    }
    let auth = await CheckGuildAdmin(obj, opt, null)
    let guildId = auth?.guildId
    if(!auth?.auth) msg2send.content = 'This command is only avaliable to guild Admins'
    if(guildId && !round){
      msg2send.content = 'There is no platoon data cached'
      gObj = await mongo.find('tbPlatoonCache', {_id: { $regex: guildId+'-'+tbId+'-' }})
    }
    if(gObj?.length > 0){
      const embedMsg = {
        content: 'Please select the round for the platoons you want to clear the cache for?',
        components: [],
        flags: 64
      }
      let x = 0
      for(let i in gObj){
        if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
        embedMsg.components[x].components.push({
          type: 2,
          label: 'Round-'+gObj[i].round,
          style: 1,
          custom_id: JSON.stringify({id: obj.id, round: +gObj[i].round})
        })
        if(embedMsg.components[x].components.length === 5) x++;
      }
      if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
      embedMsg.components[x].components.push({
        type: 2,
        label: 'Cancel',
        style: 1,
        custom_id: JSON.stringify({id: obj.id, round: 'cancel'})
      })
      await ButtonPick(obj, embedMsg)
      return
    }
    if(round){
      msg2send.content = 'tb platoon cache for Round '+round+' has been cleared'
      await mongo.del('tbPlatoonCache', { _id: guildId+'-'+tbId+'-'+round })
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e);
  }
}
