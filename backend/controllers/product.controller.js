import { productQuerySchema } from "../validations/product.validation.js";
import { fetchProducts } from "../services/product.service.js";

export async function getProducts(req, res) {
  try {
    const validated =
      productQuerySchema.parse(req.query);

    const data = await fetchProducts(validated);

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.log(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}