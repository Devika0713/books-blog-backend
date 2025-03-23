const mongoose =require("mongoose")

const catSchema = new mongoose.Schema(
    {
      name:{
        type: String,
        required: true
      },
    },
    {timestamps:true}
);

//exporting the model
module.exports = mongoose.model("Category", catSchema);