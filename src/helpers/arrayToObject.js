'use strict'
module.exports = (array = [], key)=>{
  return array.reduce((obj, item)=>{
    return{
      ...obj,
      [item[key]]: item
    }
  }, {})
}
