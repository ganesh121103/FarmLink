"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createProduct,
  resetProductSuccess,
} from "../../redux/slices/productSlice";
import { getCategories } from "../../redux/slices/categorySlice";
import Loader from "../../components/Loader";
import { FaArrowLeft, FaUpload, FaTimes } from "react-icons/fa";

const AddProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, success } = useSelector((state) => state.products);
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.categories || {}
  );

  // FIX: Always fallback to empty array to prevent "map undefined" crash
  const safeCategories = Array.isArray(categories) ? categories : [];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    unit: "lb",
    quantityAvailable: "",
    images: [],
    isOrganic: false,
    harvestDate: "",
    availableUntil: "",
    isActive: true,
  });

  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      dispatch(resetProductSuccess());
      navigate("/farmer/products");
    }
  }, [success, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...previewUrls]);

    // FIX: store actual File objects (backend needs files)
    setFormData({
      ...formData,
      images: [...formData.images, ...files],
    });
  };

  const removeImage = (index) => {
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.unit.trim()) newErrors.unit = "Unit is required";
    if (!formData.quantityAvailable || formData.quantityAvailable < 0)
      newErrors.quantityAvailable = "Valid quantity is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Correct FormData for file uploads
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "images") {
        formData.images.forEach((file) => fd.append("images", file));
      } else {
        fd.append(key, formData[key]);
      }
    });

    dispatch(createProduct(fd));
  };

  if (loading || categoriesLoading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/farmer/products"
        className="flex items-center text-green-500 hover:text-green-700 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Products
      </Link>

      <div className="glass p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Category*
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`form-input ${
                  errors.category ? "border-red-500" : ""
                }`}
              >
                <option value="">Select a category</option>

                {safeCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Description*
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className={`form-input ${
                errors.description ? "border-red-500" : ""
              }`}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-xs">{errors.description}</p>
            )}
          </div>

          {/* Price + Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Price*</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`form-input ${errors.price ? "border-red-500" : ""}`}
              />
              {errors.price && (
                <p className="text-red-500 text-xs">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity Available*
              </label>
              <input
                type="number"
                name="quantityAvailable"
                value={formData.quantityAvailable}
                onChange={handleChange}
                className={`form-input ${
                  errors.quantityAvailable ? "border-red-500" : ""
                }`}
              />
              {errors.quantityAvailable && (
                <p className="text-red-500 text-xs">
                  {errors.quantityAvailable}
                </p>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Images</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} />

            {imagePreviewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      className="h-32 w-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <Link
              to="/farmer/products"
              className="px-6 py-2 border rounded-lg text-gray-700"
            >
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;
