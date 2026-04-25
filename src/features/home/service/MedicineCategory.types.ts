export type MedicineProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

export type MedicineCategory = {
  key: string;
  label: string;
  products: MedicineProduct[];
};

export type MedicineCategorySectionProps = {
  categories?: MedicineCategory[];
  defaultCategoryKey?: string;
  onViewAll?: (category: MedicineCategory) => void;
  onAddToBag?: (product: MedicineProduct, category: MedicineCategory) => void;
};
