'use strict'
const Cmds = {}
Cmds.GetMsg = (obj, gObj)=>{
  try{
    const embedMsg = {
      color: 15844367,
      timestamp: new Date(),
      title: gObj.profile.name + " Current Raid Tickets",
      description: "```autohotkey\n"
    }
    embedMsg.description += 'Rancor    : '+numeral(gObj.inventory.currencyItem.find(x => x.currency === 20).quantity).format("0,0")+'\n'
    embedMsg.description += 'Tank      : '+numeral(gObj.inventory.currencyItem.find(x => x.currency === 21).quantity).format("0,0")+'\n'
    embedMsg.description += 'Sith      : '+numeral(gObj.inventory.currencyItem.find(x => x.currency === 22).quantity).format("0,0")+'\n'
    embedMsg.description += 'Challenge : '+numeral(gObj.inventory.currencyItem.find(x => x.currency === 23).quantity).format("0,0")+'\n'
    embedMsg.description += "```"
    return embedMsg
  }catch(e){
    console.log(e)
  }
}
module.exports = Cmds
