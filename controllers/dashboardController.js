import Product from "../models/product.js";
import Order from "../models/order.js";
import User from "../models/user.js";
import { isAdmin } from "./userController.js";

export async function getDashboardStats(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: "customer" });
    
    const categories = await Product.distinct("category");
    const totalCategories = categories.length;

    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const pendingOrders = await Order.countDocuments({ status: "Pending" });
    const deliveredOrders = await Order.countDocuments({ status: "Delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });

    const recentOrders = await Order.find().sort({ date: -1 }).limit(5);

    const lowStockProducts = await Product.find({ qty: { $lte: 10 } }).sort({ qty: 1 }).limit(10);

    const monthlyRevenue = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          revenue: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalCategories,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      recentOrders,
      lowStockProducts,
      monthlyRevenue,
      categories
    });
  } catch (error) {
    console.log("Error fetching dashboard stats", error);
    res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
  }
}
