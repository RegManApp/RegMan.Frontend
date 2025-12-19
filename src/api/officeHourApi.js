import axiosInstance from "./axiosInstance";

// =============================================
// INSTRUCTOR ENDPOINTS
// =============================================

// Get all office hours for the current instructor
export const getMyOfficeHours = async (params = {}) => {
  const response = await axiosInstance.get("/officehour/my-office-hours", {
    params,
  });
  return response.data;
};

// Create a new office hour slot
export const createOfficeHour = async (data) => {
  const response = await axiosInstance.post("/officehour", data);
  return response.data;
};

// Create multiple office hours at once
export const createBatchOfficeHours = async (officeHours) => {
  const response = await axiosInstance.post("/officehour/batch", officeHours);
  return response.data;
};

// Update an office hour
export const updateOfficeHour = async (id, data) => {
  const response = await axiosInstance.put(`/officehour/${id}`, data);
  return response.data;
};

// Delete an office hour
export const deleteOfficeHour = async (id) => {
  const response = await axiosInstance.delete(`/officehour/${id}`);
  return response.data;
};

// Confirm a booking
export const confirmBooking = async (bookingId) => {
  const response = await axiosInstance.post(
    `/officehour/bookings/${bookingId}/confirm`
  );
  return response.data;
};

// Add instructor notes to a booking
export const addInstructorNotes = async (bookingId, notes) => {
  const response = await axiosInstance.put(
    `/officehour/bookings/${bookingId}/notes`,
    { notes }
  );
  return response.data;
};

// Mark booking as completed
export const completeBooking = async (bookingId) => {
  const response = await axiosInstance.post(
    `/officehour/bookings/${bookingId}/complete`
  );
  return response.data;
};

// Mark booking as no-show
export const markNoShow = async (bookingId) => {
  const response = await axiosInstance.post(
    `/officehour/bookings/${bookingId}/no-show`
  );
  return response.data;
};

// =============================================
// STUDENT ENDPOINTS
// =============================================

// Get all available office hours for students to book
export const getAvailableOfficeHours = async (params = {}) => {
  const response = await axiosInstance.get("/officehour/available", { params });
  return response.data;
};

// Get all instructors with their available office hours count
export const getInstructorsWithOfficeHours = async () => {
  const response = await axiosInstance.get("/officehour/instructors");
  return response.data;
};

// Book an office hour
export const bookOfficeHour = async (officeHourId, data = {}) => {
  const response = await axiosInstance.post(
    `/officehour/${officeHourId}/book`,
    data
  );
  return response.data;
};

// Get student's bookings
export const getMyBookings = async (status = null) => {
  const params = status ? { status } : {};
  const response = await axiosInstance.get("/officehour/my-bookings", {
    params,
  });
  return response.data;
};

// Cancel a booking
export const cancelBooking = async (bookingId, reason = null) => {
  const response = await axiosInstance.post(
    `/officehour/bookings/${bookingId}/cancel`,
    { reason }
  );
  return response.data;
};

// =============================================
// ADMIN ENDPOINTS
// =============================================

// Get all office hours (admin)
export const getAllOfficeHours = async (params = {}) => {
  const response = await axiosInstance.get("/officehour/all", { params });
  return response.data;
};

export const officeHourApi = {
  // Instructor
  getMyOfficeHours,
  createOfficeHour,
  createBatchOfficeHours,
  updateOfficeHour,
  deleteOfficeHour,
  confirmBooking,
  addInstructorNotes,
  completeBooking,
  markNoShow,
  // Student
  getAvailableOfficeHours,
  getInstructorsWithOfficeHours,
  bookOfficeHour,
  getMyBookings,
  cancelBooking,
  // Admin
  getAllOfficeHours,
};

export default officeHourApi;
