import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Connecting to mongoDB atlas
mongoose
  .connect(
    "mongodb+srv://utkarsh:mongodb1234@cluster0.1uwnvsd.mongodb.net/nms?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const ProblemSchema = new mongoose.Schema({}, { strict: false }); 
const Problem =
  mongoose.models.Problem ||
  mongoose.model("Problem", ProblemSchema, "nms_problems"); 

// Fetching all problems data
  app.get("/api/problems", async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    console.error("Error fetching problems:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
