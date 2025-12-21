import React from "react";

const CartList = ({ cartItems, onRemove, onCheckout, onEnroll, isLoading, registrationEndDate, getEnrollmentStatus, handleDrop }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">My Cart</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : cartItems.length === 0 ? (
        <div>Your cart is empty.</div>
      ) : (
        <ul className="divide-y">
          {cartItems.map((item) => {
            const status = getEnrollmentStatus(item.courseId);
            const canDrop = status === 'approved' && registrationEndDate && new Date() < new Date(registrationEndDate);
            return (
              <li key={item.cartItemId || item.id} className="py-2 flex justify-between items-center">
                <span>{item.courseName || item.sectionName || `Slot ${item.scheduleSlotId}`}</span>
                <div className="flex gap-2">
                  {status === 'added' ? (
                    <button className="btn btn-danger" onClick={() => onRemove(item.cartItemId || item.id)}>Remove</button>
                  ) : canDrop ? (
                    <button className="btn btn-danger" onClick={() => handleDrop(item.courseId)}>Drop</button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {cartItems.length > 0 && (
        <div className="flex gap-2 mt-4">
          <button className="btn btn-primary" onClick={onEnroll}>Enroll</button>
          <button className="btn btn-secondary" onClick={onCheckout}>Checkout</button>
        </div>
      )}
    </div>
  );
};

export default CartList;
