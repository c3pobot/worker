'use strict'
module.exports = (obj = [], notify)=>{
  let msg2send = ''
  let count = 1
  for(let i in obj){
    msg2send += count.toString().padStart(2, ' ')+' '+(obj[i].discord && notify === 'on' ? '<@'+obj[i].discord.replace(/[<@!>]/g, '')+'>':obj[i].name)+'\n'
    count++;
  }
  return msg2send
}
