import express from "express";
import cors from "cors";
import productRoutes from './routes/product.routes.js';

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/products", productRoutes)

export default app;