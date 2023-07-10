'use strict'
const fs = require('fs')
module.exports = async(obj, opt)=>{
  try{
    let data, msg2send = {content: 'Error reading data file'}
    const fileBuff = await fs.readFileSync(baseDir+'/src/temp/city.list.json')
    if(fileBuff) data = JSON.parse(fileBuff)
    console.log(data.length)
    if(data){
      msg2send.content = 'City list for weather has been updated'
      for(let i in data){
        if(data[i].id){
          data[i].search = (data[i].name ? data[i].name.toLowerCase():null)
          mongo.set('weatherCities', {_id: data[i].id}, data[i])
        }
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
