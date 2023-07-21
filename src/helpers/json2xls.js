'use strict'
const xlsx = require('xlsx')
module.exports = (data = {})=>{
  try{
    let workbook = xlsx.utils.book_new()
    for(let i in data){
      if(data[i].length === 0) continue
      let worksheet = xlsx.utils.json_to_sheet(data[i])
      if(worksheet) xlsx.utils.book_append_sheet(workbook, worksheet, i)
    }
    return xlsx.write(workbook, { type: 'buffer'})
  }catch(e){
    throw(e)
  }
}
