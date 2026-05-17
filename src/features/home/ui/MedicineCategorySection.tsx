import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import MedicineCategoryTabs from "./MedicineCategoryTabs";
import MedicineCategorySlider from "./MedicineCategorySlider";
import type {
  MedicineCategory,
  MedicineProduct,
  MedicineCategorySectionProps,
} from "../service/MedicineCategory.types";
import {
  defaultMedicineCategories,
} from "../service/medicineCatalog";
import { getMedicinesByCategory } from "../service/medicineCategoryApi";
import { addProductToCart } from "../../cart/service/cartApi";

const isMongoId = (value: string) => /^[a-f\d]{24}$/i.test(value);

const getErrorMessage = (err: unknown) => {
  const error = err as {
    message?: string;
    response?: {
      status?: number;
      data?: {
        message?: string;
        error?: string;
      };
    };
  };

  if (error.response?.status === 401) return "Please log in to add items to your bag";
  return error.response?.data?.message || error.response?.data?.error || error.message || "Could not add item to bag";
};

const MedicineCategorySection = ({
  categories,
  defaultCategoryKey,
  onViewAll,
  onAddToBag,
}: MedicineCategorySectionProps) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const { data: apiCategories } = useQuery({
    queryKey: ["home", "medicineCategories"],
    queryFn: getMedicinesByCategory,
    retry: 1,
  });

  const addToBagMutation = useMutation({
    mutationFn: (productId: string) => addProductToCart(productId, 1),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const data: MedicineCategory[] = useMemo(() => {
    if (categories?.length) return categories;
    if (apiCategories?.length) return apiCategories;
    return defaultMedicineCategories;
  }, [categories, apiCategories]);

  const [activeKey, setActiveKey] = useState("");

  useEffect(() => {
    if (!data.length) return;
    const first = data[0].key;
    if (defaultCategoryKey && data.some((c) => c.key === defaultCategoryKey)) {
      setActiveKey(defaultCategoryKey);
      return;
    }
    setActiveKey((current) => (current && data.some((c) => c.key === current) ? current : first));
  }, [data, defaultCategoryKey]);

  const activeCategory = data.find((c) => c.key === activeKey) ?? data[0];

  if (!activeCategory) return null;

  const handleAddToBag = async (product: MedicineProduct, category: MedicineCategory) => {
    onAddToBag?.(product, category);

    if (!isMongoId(product.id)) {
      const toastId = toast.loading("Adding to bag...");
      toast.success(`${product.name} is ready in your order request`, { id: toastId });
      navigate("/request-order", {
        state: {
          prefilledItem: {
            name: product.name,
            quantity: "1",
            notes: "",
            imageUrl: product.imageUrl,
            price: product.price,
          },
        },
      });
      return;
    }

    setAddingProductId(product.id);
    const toastId = toast.loading("Adding to bag...");
    try {
      await addToBagMutation.mutateAsync(product.id);
      toast.success(`${product.name} added to bag`, { id: toastId });
      navigate("/cart");
    } catch (err) {
      toast.error(getErrorMessage(err), { id: toastId });
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <SectionContainer>
      <MainContainer>
        <MedicineCategoryTabs
          categories={data}
          activeCategory={activeCategory}
          onChange={setActiveKey}
          onViewAll={onViewAll}
        />

        <div className="mt-4 relative">
          <MedicineCategorySlider
            activeCategory={activeCategory}
            onAddToBag={handleAddToBag}
            addingProductId={addingProductId}
          />
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default MedicineCategorySection;
