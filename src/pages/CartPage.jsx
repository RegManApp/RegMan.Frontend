import React, { useEffect, useState } from "react";
import cartApi from "../../api/cartApi";
import CartList from "./CartList";
import toast from "react-hot-toast";
import adminApi from '../../api/adminApi';
import enrollmentApi from '../../api/enrollmentApi';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registrationEndDate, setRegistrationEndDate] = useState("");
  const [enrollments, setEnrollments] = useState([]);

  const loadCart = async () => {
    setIsLoading(true);
    try {
      const response = await cartApi.viewCart();
      setCartItems(response.data?.items || response.data || []);
    } catch (error) {
      toast.error("Failed to load cart");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    adminApi.getRegistrationEndDate().then((res) => {
      setRegistrationEndDate(res.data?.registrationEndDate || "");
    });
    enrollmentApi.getMyEnrollments().then((res) => {
      setEnrollments(res.data || []);
    });
  }, []);

  const handleRemove = async (cartItemId) => {
    try {
      await cartApi.removeFromCart(cartItemId);
      toast.success("Removed from cart");
      loadCart();
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleEnroll = async () => {
    try {
      await cartApi.enroll();
      toast.success("Enrolled successfully");
      loadCart();
    } catch (error) {
      toast.error("Failed to enroll");
    }
  };

  const handleCheckout = async () => {
    try {
      await cartApi.checkout();
      toast.success("Checkout successful");
      loadCart();
    } catch (error) {
      toast.error("Checkout failed");
    }
  };

  const getEnrollmentStatus = (courseId) => {
    const enrollment = enrollments.find((e) => e.courseId === courseId);
    return enrollment ? enrollment.status : null;
  };
  const getEnrollmentId = (courseId) => {
    const enrollment = enrollments.find((e) => e.courseId === courseId);
    return enrollment ? enrollment.enrollmentId : null;
  };
  const handleDrop = async (courseId) => {
    const enrollmentId = getEnrollmentId(courseId);
    if (enrollmentId) {
      await enrollmentApi.drop(enrollmentId);
      toast.success('Course dropped');
      enrollmentApi.getMyEnrollments().then((res) => {
        setEnrollments(res.data || []);
      });
      loadCart();
    }
  };

  return (
    <div className="container mx-auto py-8">
      <CartList
        cartItems={cartItems}
        onRemove={handleRemove}
        onEnroll={handleEnroll}
        onCheckout={handleCheckout}
        isLoading={isLoading}
        registrationEndDate={registrationEndDate}
        getEnrollmentStatus={getEnrollmentStatus}
        handleDrop={handleDrop}
      />
    </div>
  );
};

export default CartPage;
