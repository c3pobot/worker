'use strict'
module.exports = (units)=>{
  if(units) return (units.filter(x=>x.purchasedAbilityId?.length > 0).length || 0);
}
