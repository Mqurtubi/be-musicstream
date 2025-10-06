import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";

const app = express();
app.use(
  cors({
    origin: ["http://127.0.0.1:5173"], // alamat frontend React kamu
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/auth", authRoutes, cors);

app.get("/", (req, res) => {
  res.send("spotify backend running");
});

export default app;
