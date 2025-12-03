"use client";

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// Fixed: Removed the invalid 'getMyOrders' import that was causing the crash
import { getProducts } from "../../redux/slices/productSlice";
import Loader from "../../components/Loader";
import {
  FaBox,
  FaClipboardList,
  FaMoneyBillWave,
  FaPlus,
  FaArrowRight,
} from "react-icons/fa";

const DashboardPage = () => {
  const dispatch = useDispatch();

  // Select data safely from Redux
  // We use || {} to prevent crashes if state is undefined
  const { user } = useSelector((state) => state.auth || {});
  const { products, loading: productsLoading } = useSelector((state) => state.products || {});
  // Safely select orders
  const { orders, loading: ordersLoading } = useSelector((state) => state.orders || {});

  useEffect(() => {
    if (user?._id) {
      // Fetch products specifically for this farmer
      dispatch(getProducts({ farmer: user._id }));
      
      // NOTE: To fetch orders, you need to create a 'getFarmerOrders' action in
      // your orderSlice.js first. Since it doesn't exist yet, we removed the call.
    }
  }, [dispatch, user]);

  // --- SAFE DATA PROCESSING ---
  
  // 1. Default to empty arrays [] if data is null/undefined
  // This prevents the "filter of undefined" error you saw earlier
  const myProducts = Array.isArray(products) ? products : [];
  const myOrders = Array.isArray(orders) ? orders : [];

  // 2. Calculate stats
  const totalProducts = myProducts.length;
  const totalOrders = myOrders.length;

  const totalEarnings = myOrders.reduce((sum, order) => {
    // Use optional chaining (?.) for safety
    if (order?.status !== "cancelled" && order?.status !== "rejected") {
      return sum + (order?.totalAmount || 0);
    }
    return sum;
  }, 0);

  // 3. Get recent orders safely
  const recentOrders = [...myOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (productsLoading || ordersLoading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Farmer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        <Link
          to="/farmer/add-product"
          className="btn btn-primary flex items-center gap-2 shadow-md"
        >
          <FaPlus /> Add New Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">
                Total Earnings
              </p>
              <p className="text-2xl font-bold text-gray-800">
                ₨{totalEarnings.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <FaMoneyBillWave className="text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">
                Total Orders
              </p>
              <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <FaClipboardList className="text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">
                Total Products
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {totalProducts}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <FaBox className="text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
          <Link
            to="/farmer/orders"
            className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
          >
            View All <FaArrowRight className="ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id?.substring(0, 8) || "..."}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.consumer?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      ₨{order.totalAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No orders found. Your products will appear here once
                    customers start ordering.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;