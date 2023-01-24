const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const app = express()
const date = require(__dirname + "/date.js")
const mongoose = require('mongoose');
const _ = require("lodash")

mongoose.connect('mongodb+srv://ludo514:0tJ14Xf23WDeB7el@cluster0.bvdxved.mongodb.net/TodoListDB', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.urlencoded({ extended: true }))
app.use("/public",express.static("public"))
app.set("view engine", "ejs")

const workItems = []
const itemMany = [{name: "kfje"}, {name:"skzdk"}, {name:"idz"}]

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "No name"]
    }
})

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})


const List = mongoose.model("List", listSchema)
const Item = mongoose.model("Item",itemSchema)

const test = new Item({
    name: "test"
})

app.get("/", function(req, res){
    //let day = date.getDay()
    Item.find({}, function(err, results) {
        if(results.length === 0){
            Item.insertMany(itemMany, function(err){
                if(err){
                    console.log("Erreur")
                }
                else{
                    console.log("List ajouté")
                }
            })
            res.redirect("/")
        }else{
            res.render("list", { ListTitle: "Today", newItem: results })
        }
    })
})


app.post("/", function(req, res) {

    const itemName = req.body.add
    const listValue = req.body.list

    const item = new Item({
        name: itemName
    })
    
    item.save()

    if(listValue === "Today"){
        res.redirect("/")
    }else{
        List.findOne({name: listValue}, function(err, foundList) {
            if(err){
                console.log("Erreur")
            }else{
                foundList.items.push(item)
                foundList.save()
                res.redirect("/"+ listValue)
            }
        })
    }

})

app.post("/delete", function(req, res) {
    let nameItem = req.body.checkbox
    let nameList = req.body.nameList

    if(nameList === "Today"){
        if(stateCheckbox){
            Item.findOneAndRemove(nameItem.name, function(err) {
                if(err){
                    console.log("Erreur")
                }
                else{
                    console.log("Item deleted")
                }
            })
            res.redirect("/")
        }
    }else{
        List.updateOne({name: nameList}, {$pull : {items: {name: nameItem}}},function(err, results) {
            if(err){
                console.log("Erreur")
            }else{
                console.log("Element delete")
            }
        })
        res.redirect("/"+nameList)
    }
})

app.get("/:id", function(req, res) {
    let itemId = _.capitalize(req.params.id)
    List.findOne({name: itemId}, function(err,results) {
        if(err){
            console.log("erreur")
        }else{
            if(!results){
                List.create({name: itemId, items: itemMany}, function(err) {
                    if(err){
                        console.log("Erreur")
                    }else{
                        console.log("list crée")
                    }
                })
                res.redirect("/" + itemId)
            }else{
                res.render("list",{ListTitle : results.name, newItem: results.items})
            }
        }
    })
})

app.listen(3000, function(){
    console.log("Server is runing")
})
