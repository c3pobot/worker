'use strict'
const Cmds = {}
Cmds.configure = require('./configure')
Cmds.show = require('./show')
Cmds.sync = require('./sync')
module.exports = async(obj)=>{
  try{
    let tempCmd, opt = []
    if(obj.data.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          opt = obj.data.options[i].options
        }
      }
    }
    const pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj && pObj.guildId){
      const guild = (await mongo.find('guilds', {_id: pObj.guildId, sync: 1}))[0]
      if(guild && guild.sync == 1){
        if(tempCmd && Cmds[tempCmd]){
          await Cmds[tempCmd](obj, opt, guild)
        }else{
          HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
        }
      }else{
        HP.ReplyMsg(obj, {content: 'This command is only available to synced guilds'})
      }
    }else{
      HP.ReplyMsg(obj, {content: 'You do not have allyCode linked to discordId'})
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
