'use strict'
const raidConfig = {
  rancor: {
    id: 'rancor',
    currency: 20,
    open: 60000,
    hold: 0
  },
  tank: {
    id: 'aat',
    currency: 21,
    open: 90000,
    hold: 0
  },
  sith: {
    id: 'sith_raid',
    currency: 22,
    open: 110000,
    hold: 0
  },
  crancor: {
    id: 'rancor_challenge',
    currency: 23,
    open: 180000,
    hold: 0
  }
}
module.exports = async(obj, opt = [], guild)=>{
  try{
    let msg2send = {content: 'This command requires guild admin'}, raid
    if(await HP.CheckGuildAdmin(obj, opt = [], guild)){
      msg2send.content = 'You did not provide the correct informaion'
      if(opt.find(x=>x.name == 'raid')) raid = opt.find(x=>x.name == 'raid').value
      if(raid && raidConfig[raid]){
        msg2send.content = 'Raid announcement configuration for **'+raid+'** was removed for guild **'+guild.guildName+'**'
        await mongo.del('raidSchedule', {_id: raidConfig[raid].id+'-'+guild._id})
        await mongo.pull('guilds', {_id: guild._id}, {raids: {id: raidConfig[raid].id}})
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
