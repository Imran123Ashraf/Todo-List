const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");
// const date=require(__dirname+"/date.js");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://imranashraf23081999:Ashraf001@todolist.vglenv5.mongodb.net/TodoList", { useNewUrlParser: true });

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your toDoList!"

});

const item2 = new Item({
    name: "Hit the + button to add a new item."

});

const item3 = new Item({
    name: "<--Hit this to delete an item."

});


const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {



    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully Saved all default items to DB");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { ListTitle: "Today", newListItem: foundItems });
        }

    });



});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);

            } else {
                //Show an existing list

                res.render("list", { ListTitle: foundList.name, newListItem: foundList.items })
            }
        }
    });

});


app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();

        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (er, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                console.log("Successfully removed the item");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }



});





app.post("/work", function (req, res) {

    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});


app.get("/about", function (req, res) {

    res.render("about");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3001;
}
// app.listen(port);


app.listen(port, function () {

    console.log("The server is started successfully");
});