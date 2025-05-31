const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const catRoute = require("./routes/categories");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { BlobServiceClient } = require("@azure/storage-blob");
const mime = require("mime-types");

//03/05  TO DO - The app deployed is not connected to DB - check the connection string and env file
dotenv.config();
app.use(express.json());
// app.use("/images", express.static(path.join(__dirname, "/images")));
// console.log("Images path set to: ", path.join(__dirname, "/images"));

app.use(cors({ origin: "https://books-blog-frontend-eight.vercel.app" }));

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
//Connect using mongo db atlas
//Create schemas
//Create routes and test it using postman
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Connected to mongoDB"))
  .catch((error) => console.log(error));

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, req.body.name);
//   },
// });

// const upload = multer({ storage: storage });
// app.post("/api/upload", upload.single("file"), (req, res) => {
//   res.status(200).json("File has been uploaded");
// });

const upload = multer(); // Use memory storage

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json("No file uploaded");
    }

    // Connect to Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient("images"); // use your container name
    // Use the original file name or req.body.name
    const blobName = req.body.name || req.file.originalname;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const contentType = mime.lookup(blobName) || "application/octet-stream";
    // Upload buffer
    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    // Get the URL
    const url = blockBlobClient.url;
    res.status(200).json({ url });
    console.log("File uploaded successfully:", url);
  } catch (err) {
    res.status(500).json("Upload failed: " + err.message);
  }
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", catRoute);

app.use("/", (req, res) => {
  res.send("Welcome to Ink & Innovation");
});
//creates a http server
app.listen("5000", () => {
  console.log("backend is running");
});

// const fs= require("fs")
