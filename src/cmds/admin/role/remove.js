'use strict'
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'error with the provided info'}, roleName
    const roleId = await HP.GetOptValue(opt, 'role')
    if(roleId){
      msg2send.content = 'You did not provide a role'
      if(obj.data && obj.data.resolved && obj.data.resolved.roles && obj.data.resolved.roles[roleId]){
        roleName = obj.data.resolved.roles[roleId].name
        if(roleName == '@everyone') roleName = ' everyone'
      }
    }
    if(roleName){
      msg2send.content = '**@'+roleName+'** is not a bot server admin role'
      const guild = (await mongo.find('discordServer', {_id: obj.guild_id}))[0]
      if(guild?.admin?.filter(x=>x.id == roleId).length > 0){
        await mongo.pull('discordServer', {_id: obj.guild_id}, {admin: {id: roleId}})
        msg2send.content = '**@'+roleName+'** was removed as a bot server admin role'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
