//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sewy999:sewy999@cluster1.8hu0bkv.mongodb.net/ToDoListDB",{useNewUrlParser:true});

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name : "Welcome to todoList"
});

const item2 = new Item({
  name : "Hit the + button to add a new item."
});

const item3 = new Item({
  name : "Hit the <-- button to delete the item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items : [itemSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) 
{
  // const day = date.getDate();
  Item.find().then(function (foundItems) 
  {
    if(foundItems.length === 0)
    {
      Item.insertMany(defaultItems).then(function () {
        console.log("Successfully saved defult items to DB");
      }).catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }).catch(function (err) {
    console.log(err);
  });
  
});

app.get("/:customListName", function(req, res)
{
  const customListName = req.params.customListName;
  List.findOne({name: customListName}).then(function(foundList){
    if(!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      })
      list.save();
      res.redirect("/"+customListName);
    }
    else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }).catch(function(err){
    console.log(err);
  })

})


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}).then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
    }).catch(function(err){
      console.log(err);
    })
  }
});

app.post("/delete", function(req, res)
{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(function(){
      res.redirect("/");
  }).catch(function (err) {
    console.log(err);
  });
  }
  else{
    
  }

})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
