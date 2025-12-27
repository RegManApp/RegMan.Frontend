import React from "react";
import { Card, Button, EmptyState, Loading } from "../common";
import { formatDate } from "../../utils/helpers";
import { useTranslation } from "react-i18next";

const CartList = ({
  cartItems,
  onRemove,
  onCheckout,
  onEnroll,
  isLoading,
  hasLoadError,
  readOnly,
  registrationEndDate,
  getEnrollmentStatus,
  handleDrop,
}) => {
  const { t } = useTranslation();

  const items = Array.isArray(cartItems) ? cartItems : [];
  const now = new Date();
  const end = registrationEndDate ? new Date(registrationEndDate) : null;
  const isRegistrationOpen = !end || now < end;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("cart.title")}</h2>
        {registrationEndDate && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {isRegistrationOpen
              ? t("cart.registration.closesOn", { date: formatDate(registrationEndDate) })
              : t("cart.registration.closedOn", { date: formatDate(registrationEndDate) })}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="py-8">
          <Loading text={t("cart.loading")} />
        </div>
      ) : hasLoadError ? (
        <EmptyState
          title={t("cart.errors.loadTitle")}
          description={t("cart.errors.loadDescription")}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={t("cart.empty.title")}
          description={t("cart.empty.description")}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const title =
              item.courseName || item.sectionName || `Slot ${item.scheduleSlotId}`;

            const enrollmentStatus = item.courseId
              ? getEnrollmentStatus?.(item.courseId)
              : null;

            const isAlreadyEnrolled =
              enrollmentStatus === 1 ||
              enrollmentStatus === "Enrolled" ||
              enrollmentStatus === 0 ||
              enrollmentStatus === "Pending";

            return (
              <Card key={item.cartItemId || item.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{title}</p>
                    {isAlreadyEnrolled && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {t("cart.alreadyEnrolledHint")}
                      </p>
                    )}
                    {!isRegistrationOpen && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {t("cart.registrationClosedHint")}
                      </p>
                    )}
                  </div>

                  {!readOnly && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemove?.(item.cartItemId || item.id)}
                      >
                        {t("common.remove")}
                      </Button>

                      {/* Optional: keep drop available if backend allows and registration is open */}
                      {isRegistrationOpen &&
                        item.courseId &&
                        (enrollmentStatus === 1 || enrollmentStatus === "Enrolled" || enrollmentStatus === 0 || enrollmentStatus === "Pending") &&
                        typeof handleDrop === "function" && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDrop(item.courseId)}
                          >
                            {t("courses.drop")}
                          </Button>
                        )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

          {!readOnly && (
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                className="w-full sm:w-auto"
                onClick={onEnroll}
                disabled={!isRegistrationOpen}
              >
                {t("cart.actions.enroll")}
              </Button>
              <Button
                className="w-full sm:w-auto"
                variant="secondary"
                onClick={onCheckout}
                disabled={!isRegistrationOpen}
              >
                {t("cart.actions.checkout")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartList;
