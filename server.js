const express = require("express");
const mongoose = require("mongoose");
const MONGODB_URI =
  "mongodb://tanmay:tanmay1998@ds135844.mlab.com:35844/inventory-testing";
mongoose.connect(
  MONGODB_URI,
  function() {
    console.log("connected to DB");
  }
);
const VpiInventory = require("./models/inventory");
var masterInventory = {};
var masterInventoryTable = [];
var medicentoProductTable = [];
const port = process.env.PORT || 3000;
const app = express();
app.set("view engine", "ejs");
function filterSpecialChar(string){
     var arrayString = string.split("");
     var count = arrayString.length/2;
     var check_float =  Number(count) === count && count % 1 !== 0;
     var format = /[~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
     if(check_float == true){
        var start_length = parseInt(count)+1;
        var end_length = parseInt(count);
     }else{
        var start_length = parseInt(count);
        var end_length = parseInt(count);
     }
        for(var i=0;i<parseInt(arrayString.length);i++){

        if(format.test(arrayString[i])){
          arrayString[i] = null;
        }else{
            break;
        }
    }
    for(var i=arrayString.length-1;i>0;i--){
        if(format.test(arrayString[i])){
          arrayString[i] = null;
        }else{
            break;
        }
    }

   var arrayString = arrayString.filter(function(data){return data != null});
   return arrayString.join('');
 }
app.get("/masterInventory",(req,res)=>{
  VpiInventory.find().exec().then(function(item){
    var startIndex=0;
    item.forEach(function(element){
      if(typeof masterInventory[filterSpecialChar(element.Item_name)] === 'undefined'){
      masterInventory[filterSpecialChar(element.Item_name)] = startIndex;
      masterInventoryTable.push({Item_name: element.Item_name, inventoryId:startIndex, quantity:Number(element.qty), product_Id:startIndex});
      medicentoProductTable.push({product_Id:startIndex, product_Name:element.Item_name, manufacturer_Id:element.manfc_code,manufacturer_Name:element.manfc_name, mrp: element.mrp,created_at: element.created_at, quantity:Number(element.qty)});
      startIndex++;
      }
      else{
        masterInventoryTable[masterInventory[filterSpecialChar(element.Item_name)]].quantity+=Number(element.qty);
        masterInventory[filterSpecialChar(element.Item_name)].quantity+=Number(element.qty);
        medicentoProductTable[masterInventory[filterSpecialChar(element.Item_name)]].quantity+=Number(element.qty);
      }
    });
  res.setHeader('Content-Type', 'application/json');
  res.send(masterInventoryTable);
  console.log(Object.keys(masterInventory).length);
  // cosole.log(item.length)
});
});
app.get("/productTable",(req,res)=>{
  VpiInventory.find().exec().then(function(item){
    var startIndex=0;
    item.forEach(function(element){
      if(typeof masterInventory[filterSpecialChar(element.Item_name)] === 'undefined'){
      masterInventory[filterSpecialChar(element.Item_name)] = startIndex;
      masterInventoryTable.push({Item_name: element.Item_name, inventoryId:startIndex, quantity:Number(element.qty), product_Id:startIndex});
      medicentoProductTable.push({product_Id:startIndex, product_Name:element.Item_name, manufacturer_Id:element.manfc_code,manufacturer_Name:element.manfc_name, mrp: element.mrp,created_at: element.created_at, quantity:Number(element.qty)});
      startIndex++;
      }
      else{
        masterInventoryTable[masterInventory[filterSpecialChar(element.Item_name)]].quantity+=Number(element.qty);
        masterInventory[filterSpecialChar(element.Item_name)].quantity+=Number(element.qty);
        medicentoProductTable[masterInventory[filterSpecialChar(element.Item_name)]].quantity+=Number(element.qty);
      }
    });
  res.setHeader('Content-Type', 'application/json');
  res.send(medicentoProductTable);
  console.log(Object.keys(masterInventory).length);
  // cosole.log(item.length)
});
});

app.listen(port, function() {
  console.log("Server Has Started at port : " + port);
});
