'use strict'
const raidConfig = {
  rancor: {
    id: 'rancor',
    name: 'rancor',
    currency: 20,
    open: 60000,
    hold: 0
  },
  tank: {
    id: 'aat',
    name: 'tank',
    currency: 21,
    open: 90000,
    hold: 0
  },
  sith: {
    id: 'sith_raid',
    name: 'sith',
    currency: 22,
    open: 110000,
    hold: 0
  },
  crancor: {
    id: 'rancor_challenge',
    name: 'crancor',
    currency: 23,
    open: 180000,
    hold: 0
  }
}
module.exports = async(obj, opt = [], guild)=>{
  try{
    console.log(obj.data.resolved)
    let msg2send = {content: 'This command requires guild admin'}, raid, rId, chId, holdTime, role
    if(await HP.CheckGuildAdmin(obj, opt, guild)){
      msg2send.content = 'You did not provide the correct informaion'
      if(opt.find(x=>x.name == 'raid')) raid = opt.find(x=>x.name == 'raid').value
      if(opt.find(x=>x.name == 'role')){
        if(obj.data && obj.data.resolved && obj.data.resolved.roles[opt.find(x=>x.name == 'role').value]){
          if(obj.data.resolved.roles[opt.find(x=>x.name == 'role').value].name.replace(/@/g, '') != 'everyone') rId = opt.find(x=>x.name == 'role').value
        }
      }
      if(opt.find(x=>x.name == 'channel')) chId = opt.find(x=>x.name == 'channel').value
      if(opt.find(x=>x.name == 'hold')) holdTime = +opt.find(x=>x.name == 'hold').value
      if(raid && raidConfig[raid]){
        let raidObj = JSON.parse(JSON.stringify(raidConfig[raid]))
        raidObj.hold = 0
        raidObj.chId = obj.channel_id
        raidObj.guildId = guild._id
        if(guild && guild.raids && guild.raids.find(x=>x.id == raidObj.id)) raidObj = guild.raids.find(x=>x.id == raidObj.id)
        raidObj.sId = obj.guild_id
        if(rId) raidObj.roleId = rId
        if(chId) raidObj.chId = chId
        if(holdTime >= 0) raidObj.hold = holdTime
        if(guild.raids && guild.raids.filter(x=>x.id == raidObj.id).length > 0){
          await mongo.set('guilds', {_id: guild._id, 'raids.id': raidObj.id}, {'raids.$': raidObj})
        }else{
          await mongo.push('guilds', {_id: guild._id}, {raids: raidObj})
        }
        if(raidObj.roleId) role = await HP.GetRole(obj.guild_id, raidObj.roleId)
        msg2send.content = 'Raid **'+raid+'** was updated '+(raidObj.chId ? 'to announce in <#'+raidObj.chId+'> ':'')+(raidObj.hold > 0 ? 'with a hold time of '+raidObj.hold+' mins':'with no hold time')+(role ? ' and will tag **@'+role.name+'**':'')
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
