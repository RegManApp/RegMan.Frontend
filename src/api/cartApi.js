import axiosInstance from "./axiosInstance";

export const cartApi = {
  // Add to cart by scheduleSlotId (Student only)
  addToCart: (scheduleSlotId) => {
    return axiosInstance.post(`/cart`, null, { params: { scheduleSlotId } });
  },

  // Add to cart by courseId (Student only)
  addToCartByCourse: (courseId) => {
    return axiosInstance.post(`/cart/by-course/${courseId}`);
  },

  // Remove from cart (Student only)
  removeFromCart: (cartItemId) => {
    return axiosInstance.delete(`/cart/${cartItemId}`);
  },

  // View cart (Student only)
  viewCart: () => {
    return axiosInstance.get(`/cart`);
  },

  // Enroll from cart (Student only)
  enroll: () => {
    return axiosInstance.post(`/cart/enroll`);
  },

  // Checkout cart (Student only)
  checkout: () => {
    return axiosInstance.post(`/cart/checkout`);
  },

  // Get my enrollments (Student only)
  getMyEnrollments: () => {
    return axiosInstance.get(`/cart/my-enrollments`);
  },
};

export default cartApi;
