'use strict'
const calcGuildStats = require('./calcGuildStats')
module.exports = (obj, members = [])=>{
  try{
    obj.updated = Date.now()
    obj.id = obj.profile.id
    obj.name = obj.profile.name
    calcGuildStats(obj, members)
  }catch(e){
    throw(e);
  }
}
