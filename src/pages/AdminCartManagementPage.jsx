import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import CartList from "../components/cart/CartList";

import transcriptApi from "../api/transcriptApi";
import adminApi from "../api/adminApi";

const AdminCartManagementPage = () => {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [hasCartLoadError, setHasCartLoadError] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const columns = useMemo(
    () => [
      { key: "studentId", header: t("transcript.admin.studentId") },
      { key: "fullName", header: t("transcript.admin.fullName") },
      { key: "email", header: t("transcript.admin.email") },
      {
        key: "actions",
        header: t("common.actions"),
        render: (_value, row) => (
          <Button size="sm" onClick={() => handleSelectStudent(row)}>
            {t("common.select")}
          </Button>
        ),
      },
    ],
    [t]
  );

  const handleSearch = async () => {
    const q = (searchQuery || "").trim();
    if (!q) {
      setSearchResults([]);
      setSelectedStudent(null);
      setCartItems([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await transcriptApi.searchStudents({ query: q, take: 20 });
      setSearchResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error(t("transcript.errors.searchFailed"));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const loadStudentCart = async (studentUserId) => {
    setIsLoadingCart(true);
    setHasCartLoadError(false);
    try {
      const res = await adminApi.getStudentCart(studentUserId);
      const dto = res?.data;
      const candidate = dto?.cartItems ?? dto?.CartItems ?? dto?.items ?? dto;
      setCartItems(Array.isArray(candidate) ? candidate : []);
    } catch {
      setCartItems([]);
      setHasCartLoadError(true);
      toast.error(t("cart.errors.fetchFailed"));
    } finally {
      setIsLoadingCart(false);
    }
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setCartItems([]);
    const studentUserId = student?.studentUserId;
    if (!studentUserId) {
      setHasCartLoadError(true);
      toast.error(t("cart.errors.fetchFailed"));
      return;
    }
    await loadStudentCart(studentUserId);
  };

  return (
    <Card title={t("nav.cartManagement")}
      className="space-y-4"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-end">
          <Input
            label={t("transcript.admin.searchLabel")}
            placeholder={t("transcript.admin.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {t("common.search")}
          </Button>
        </div>

        <Table
          columns={columns}
          data={searchResults}
          isLoading={isSearching}
          emptyMessage={t("transcript.admin.noResults")}
        />
      </div>

      {selectedStudent ? (
        <div className="pt-2">
          <CartList
            cartItems={cartItems}
            isLoading={isLoadingCart}
            hasLoadError={hasCartLoadError}
            readOnly
          />
        </div>
      ) : null}
    </Card>
  );
};

export default AdminCartManagementPage;
