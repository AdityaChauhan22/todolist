//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");


const mongoose =require("mongoose");
const { Schema } = mongoose;

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemschema= new Schema({
  name: String
});

const items=mongoose.model("item",itemschema);

const item1=new items({
  name:"Buy Food"
});

const item2=new items({
  name:"Cook Food"
});

const item3=new items({
  name:"Eat Food"
});

const defaultArr=[item1,item2,item3];

const listSchema=new Schema({
  name:String,
  listarr:[itemschema]
});

const List = mongoose.model("List",listSchema);


// items.find({},function(err,results){
//   if(err){
//     console.log(err);
//   }else{
//     console.log(results);
//   }
// })


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));




app.post("/delete",function(req,res){
    const item_id=req.body.check;
    const title=req.body.title;
  console.log(title);
  console.log(item_id);
    if(title==="Today"){
      items.findByIdAndRemove(item_id,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Deleted");
          res.redirect("/");
        }
      });
    }

    else{
        List.findOneAndUpdate({name:title},{$pull: {listarr : {_id : item_id }}},{new: true},function(err,result){
            if(!err){
              
              // console.log(result);
              console.log(result.listarr);
              console.log(item_id);
              res.redirect("/"+title);
            }
        });
        
    }
    
});





app.get("/", function(req, res) {

  items.find({},function(err,results){
    if(err){
      console.log(err);
    }else{
      if(results.length===0)
      {
        items.insertMany(defaultArr,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("successfully Entered");
        }
      });
    }
      
      res.render("list", {listTitle: "Today", newListItems: results});
    }
  });

  

});

app.post("/", function(req, res){

  const item_temp = req.body.newItem;
  const title =req.body.title;

  const temp=new items({
    name:item_temp
  });
  
  if(title==="Today"){
    temp.save();
    res.redirect("/");
  }
  else{
      List.findOne({name:title},function(err,result){
        if(!err){
          console.log(result.listarr);
          result.listarr.push(temp);
          result.save();
          console.log(result);
        }
        res.redirect("/"+title);
      });
      
  }
  
 
});




app.get("/:title",function(req,res){
  const title = (req.params.title);
  List.findOne({name:title},function(err,results){
    if(err){
      console.log(err);
    }else{
      if(!results){
        const list_item= new List({
          name:title,
          listarr:defaultArr
        });
        list_item.save();
        res.render("list",{listTitle: list_item.name , newListItems: list_item.listarr});
      }
      else{
        // console.log(results);
        res.render("list",{listTitle: results.name , newListItems: results.listarr});
      }
    }
  });
 

  
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
