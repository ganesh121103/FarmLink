"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getConsumerOrders } from "../redux/slices/orderSlice";
import OrderItem from "../components/OrderItem";
import Loader from "../components/Loader";
import { FaShoppingBasket } from "react-icons/fa";

const OrdersPage = () => {
  const dispatch = useDispatch();

  // SAFE fallback to avoid undefined errors  
  const { orders = [], loading = false } =
    useSelector((state) => state.orders || {});

  const [filter, setFilter] = useState("all");

  useEffect(() => {
    dispatch(getConsumerOrders());
  }, [dispatch]);

  // SAFE filtering
  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order?.status === filter);

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {/* FILTER BUTTONS */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            "all",
            "pending",
            "accepted",
            "completed",
            "rejected",
            "cancelled",
          ].map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-lg transition-colors
                ${
                  filter === value
                    ? value === "rejected" || value === "cancelled"
                      ? "bg-red-500 text-white"
                      : "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ORDER LIST */}
      {filteredOrders?.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <OrderItem key={order?._id || index} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 glass rounded-xl">
          <FaShoppingBasket className="text-green-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
          <p className="text-gray-600">
            {filter === "all"
              ? "You haven't placed any orders yet."
              : `You don't have any ${filter} orders.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
