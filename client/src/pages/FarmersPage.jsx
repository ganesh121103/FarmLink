"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllFarmers } from "../redux/slices/farmerSlice";
import FarmerCard from "../components/FarmerCard";
import Loader from "../components/Loader";
import { FaSearch, FaLeaf } from "react-icons/fa";

const FarmersPage = () => {
  const dispatch = useDispatch();

  // 1. Select State safely
  const { farmers, loading } = useSelector((state) => state.farmers || {});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getAllFarmers());
  }, [dispatch]);

  // --- THE FIX: DATA NORMALIZATION ---
  // This block fixes the issue where the API returns an object instead of an array
  let farmersList = [];

  if (Array.isArray(farmers)) {
    // Case A: It's already an array [ ... ]
    farmersList = farmers;
  } else if (farmers?.data && Array.isArray(farmers.data)) {
    // Case B: It's inside 'data' { success: true, data: [ ... ] }
    farmersList = farmers.data;
  } else if (farmers?.farmers && Array.isArray(farmers.farmers)) {
    // Case C: It's inside 'farmers' { success: true, farmers: [ ... ] }
    farmersList = farmers.farmers;
  } else if (farmers?.users && Array.isArray(farmers.users)) {
    // Case D: It's inside 'users' { users: [ ... ] }
    farmersList = farmers.users;
  }

  // Debugging Log (Check your browser console F12 to see this!)
  console.log("Final Processed List:", farmersList);

  // 2. FILTERING LOGIC
  const filteredFarmers = farmersList.filter((farmer) => {
    // Safety check: ensure farmer object and name exist
    if (!farmer || !farmer.name) return false;
    return farmer.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading && farmersList.length === 0) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Farmers</h1>

      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search farmers..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
        </div>
      </div>

      {filteredFarmers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarmers.map((farmer) => (
            <FarmerCard key={farmer._id} farmer={farmer} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FaLeaf className="text-green-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Farmers Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? `No matches for "${searchTerm}"`
              : "The farmer directory is empty."}
          </p>
          {/* Debug Helper for you */}
          <p className="text-xs text-gray-400 bg-gray-100 p-2 rounded inline-block">
             Debug Info: Found {farmersList.length} total farmers from API.
          </p>
        </div>
      )}
    </div>
  );
};

export default FarmersPage;