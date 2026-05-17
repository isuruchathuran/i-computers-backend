import Order from "../models/order.js";
import Product from "../models/product.js";

export async function createOrder(req, res) {

  try {

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    if (!req.body.items || req.body.items.length === 0) {
      return res.status(400).json({
        message: "No items found",
      });
    }

    const orderData = {

      orderId: "ORD000001",

      firstName: req.body.firstName,

      lastName: req.body.lastName,

      addressLine1: req.body.addressLine1,

      addressLine2: req.body.addressLine2,

      city: req.body.city,

      Country: req.body.Country,

      postalCode: req.body.postalCode,

      email: req.user?.email,

      phone: req.body.phone,

      items: [],

      total: 0,
    };

    const lastOrder = await Order.findOne().sort({ date: -1 });

    if (lastOrder != null) {

      const lastOrderId = lastOrder.orderId;

      const lastOrderNumberInString = lastOrderId.replace("ORD", "");

      const lastOrderNumber = parseInt(lastOrderNumberInString);

      const newOrderNumber = lastOrderNumber + 1;

      const newOrderNumberInString = newOrderNumber
        .toString()
        .padStart(6, "0");

      orderData.orderId = "ORD" + newOrderNumberInString;
    }

    for (let i = 0; i < req.body.items.length; i++) {

      const item = req.body.items[i];

      const product = await Product.findOne({
        productId: item.productId,
      });

      if (product == null) {

        return res.status(404).json({
          message: "Product not found",
        });
      }

      if (product.qty < item.qty) {

        return res.status(400).json({
          message: "Not enough quantity available",
        });
      }

      orderData.items.push({

        productId: product.productId,

        name: product.name,

        labeledPrice: product.labeledPrice,

        image: product.images?.[0],

        qty: item.qty,
      });

      orderData.total += product.price * item.qty;
    }

    const order = new Order(orderData);

    await order.save();

    res.status(201).json({

      message: "Order created successfully",

      orderId: orderData.orderId,
    });

  } catch (error) {

    console.log("Error creating order", error);

    res.status(500).json({

      message: "Error creating order",

      error: error.message,
    });
  }
}