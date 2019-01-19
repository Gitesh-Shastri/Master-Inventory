const express = require("express");
const mongoose = require("mongoose");
const MONGODB_URI =
  "mongodb://tanmay:tanmay1998@ds263590.mlab.com:63590/medicento";
mongoose.connect(
  MONGODB_URI,
  function() {
    console.log("connected to DB");
  }
);
const VpiInventory = require("./models/inventory");
var SalesOrder = require("./models/SalesOrder");
var pharmacy = require("./models/pharmacy");
var area = require("./models/area");
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
var testingtable = [
  {
    name:"test1",
    medicine:['5beac728a781b00021108353','5beac728a781b00021108354'],
    pos:{
      lat:41,
      long:43
    }
  },
  {
    name:"test2",
    medicine:['5beac728a781b00021108354'],
    pos:{
      lat:41,
      long:64
    }
  }
];
function deg2rad(deg) {
  return deg * (Math.PI/180)
}
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

app.get("/allocate",(req,res)=>{
  SalesOrder.find().exec().then(function(item){
    // console.log(navigator.geolocation.getCurrentPosition());
    var pos = {
        lat: 40,
        long: 64
    };
    console.log(item[0]);
    var pharmacy_id = item[0].pharmacy_id;
    pharmacy.find().exec().then(function(pharma){
      console.log(pharma[0]);
      pharma.forEach((pharma)=>{
        if(pharma._id.equals(pharmacy_id) == true){
          // console.log(pharma.area);
          var area_id = pharma.area;
          flag=0;
          area.find().exec().then(function(areas){
            areas.forEach((area)=>{
              if(area_id.equals(area.area_id) == true || !flag){
                flag=1;
                console.log("found");
                item[0].order_items.forEach((medicine)=>{
                  // console.log(medicine);
                  var choosen="",mindis=1000000000000000000000;
                  testingtable.forEach((dist)=>{
                    // console.log(dist.medicine );
                    var d=dist.medicine;
                    d.forEach((medi)=>{
                        // console.log(medicine);
                        // console.log(medi);
                      var m =String(medicine);
                      // console.log(typeof m);
                      if(m === medi){
                        // console.log("atleast here");
                        // console.log(Number(pos.lat),Number(pos.long),Number(dist.pos.lat),Number(dist.pos.long));
                        var dis=getDistanceFromLatLonInKm(Number(pos.lat),Number(pos.long),Number(dist.pos.lat),Number(dist.pos.long));
                        // console.log(dis);
                        if(dis<mindis){
                          choosen=dist.name;
                          mindis=dis;
                        };
                      };
                    });
                  });
                  console.log("choosen for",medicine,choosen);
                  // console.log(choosen);
                  // console.log("done");
                });
                //do fetch further coordinates of pharmacy
              };
            });
          });
        };
      });
    });
    res.status(200).json(item[0]);
  });
});

app.listen(port, function() {
  console.log("Server Has Started at port : " + port);
});
