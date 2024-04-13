'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const fs = require('fs')

const readFile = async(file)=>{
  try{
    let obj = await fs.readFileSync(file)
    if(obj) return JSON.parse(obj)
  }catch(e){
    log.error(e)
  }
}
module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'Error reading data file'}
  let data = await readFile(`${baseDir}/src/temp/city.list.json`)
  if(data?.length > 0){
    msg2send.content = 'City list for weather has been updated'
    for(let i in data){
      if(data[i].id){
        data[i].search = (data[i].name ? data[i].name.toLowerCase():null)
        mongo.set('weatherCities', {_id: data[i].id}, data[i])
      }
    }
  }
  return msg2send
}
