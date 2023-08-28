'use strict'
const sorter = require('json-array-sorter')
const GetIngredients = (ingredients = [], neededMats = {}, inventory = [])=>{
  try{
    let i = ingredients.length
    while(i--){
      if(!ingredients[i].qty) continue;
      if(!neededMats[ingredients[i].id]){
        let item = inventory.find(x=>x.id === ingredients[i].id)
        neededMats[ingredients[i].id] = {
          id: ingredients[i].id,
          nameKey: ingredients[i].nameKey,
          iconKey: ingredients[i].iconKey,
          count: 0,
          inventory: +item?.quantity || 0,
        }
      }
      if(neededMats[ingredients[i].id]) neededMats[ingredients[i].id].count += ingredients[i].qty
    }
  }catch(e){
    throw(e)
  }
}
module.exports = (inventory = [], relicRecipe = [], currentTier)=>{
  try{
    let neededMats = {}
    let i = relicRecipe.length
    while(i--){
      if(currentTier >= relicRecipe[i].tier) continue;
      GetIngredients(relicRecipe[i].ingredients, neededMats, inventory)
    }
    return sorter([{ column: 'count', order: 'descending' }], Object.values(neededMats))
  }catch(e){
    throw(e);
  }
}
