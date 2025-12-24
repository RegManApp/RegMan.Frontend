import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import cartApi from "../api/cartApi";
import adminApi from "../api/adminApi";
import enrollmentApi from "../api/enrollmentApi";
import CartList from "../components/cart/CartList";

const CartPage = () => {
  const { t } = useTranslation();
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
      toast.error(t('cart.errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    adminApi.getRegistrationEndDate().then((res) => {
      setRegistrationEndDate(res.data?.registrationEndDate || res.data?.registrationEndDate || "");
    });
    enrollmentApi
      .getMyEnrollments()
      .then((res) => {
        const data = res?.data;
        setEnrollments(Array.isArray(data) ? data : []);
      })
      .catch(() => setEnrollments([]));
  }, []);

  const handleRemove = async (cartItemId) => {
    try {
      await cartApi.removeFromCart(cartItemId);
      toast.success(t('courses.toasts.removedFromCart'));
      loadCart();
    } catch (error) {
      toast.error(t('cart.errors.removeFailed'));
    }
  };

  const handleEnroll = async () => {
    try {
      await cartApi.enroll();
      toast.success(t('cart.toasts.enrolled'));
      loadCart();
    } catch (error) {
      toast.error(t('cart.errors.enrollFailed'));
    }
  };

  const handleCheckout = async () => {
    try {
      await cartApi.checkout();
      toast.success(t('cart.toasts.checkoutSuccess'));
      loadCart();
    } catch (error) {
      toast.error(t('cart.errors.checkoutFailed'));
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
      toast.success(t('courses.toasts.dropped'));
      enrollmentApi
        .getMyEnrollments()
        .then((res) => {
          const data = res?.data;
          setEnrollments(Array.isArray(data) ? data : []);
        })
        .catch(() => setEnrollments([]));
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
