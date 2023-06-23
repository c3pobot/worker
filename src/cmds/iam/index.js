'use strict'
const ShowListOfRoles = require('./showListOfRoles')
module.exports = async(obj = {})=>{
  try{
    let msg2send = {content: 'Error finding your discord Id'}, roleId, roleName, botPerms, hasRolePerm, guild
    let dId = obj.member?.user?.id
    if(obj.confirm?.roleId){
      await HP.ReplyButton(obj)
      roleId = obj.confirm.roleId
    }
    if(!roleId) roleId = await HP.GetOptValue(obj.data?.options, 'role')
    if(dId){
      msg2send.content = 'There are no self assign roles'
      guild = (await mongo.find('discordServer', {_id: obj.guild_id}, {selfassignroles: 1}))[0]
    }
    if(guild?.selfassignroles?.length > 0 && !roleId){
      await ShowListOfRoles(obj, guild.selfassignroles)
      return;
    }
    if(!roleId) msg2send.content = 'No role was provided'
    if(roleId){
      msg2send.content = 'Error getting role info'
      const roles = await HP.DiscordQuery('guilds/'+obj.guild_id+'/roles')
      roleName = roles?.find(x=>x?.id === roleId)?.name
    }
    if(guild?.selfassignroles?.length > 0 && roleId && roleName){
      msg2send.content = '**@'+roleName+'** is not a self assign role'
      if(guild.selfassignroles.filter(x=>x.id === roleId).length > 0){
        msg2send.content = 'Error getting permissions info for the bot'
        botPerms = await HP.GetBotPerms(obj.guild_id)
      }
    }
    if(botPerms?.length > 0){
      msg2send.content = 'The bot does not have permission to add roles to users'
      if(botPerms.filter(x=>x === 'ManageRoles').length > 0) hasRolePerm = true
    }
    if(hasRolePerm){
      msg2send.content = 'Error assing you the **@'+roleName+'** role'
      const status = await HP.DiscordQuery('guilds/'+obj.guild_id+'/members/'+dId+'/roles/'+roleId, 'PUT')
      if(status === 204) msg2send.content = 'You have been assigned the **@'+roleName+'** role'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
