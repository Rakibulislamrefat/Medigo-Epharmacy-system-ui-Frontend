import type { MedicineCategory } from "../service/MedicineCategory.types";
import CustomButton from "../../../shared/button/CustomButton";

type MedicineCategoryTabsProps = {
  categories: MedicineCategory[];
  activeCategory: MedicineCategory;
  onChange: (key: string) => void;
  onViewAll?: (category: MedicineCategory) => void;
};

const MedicineCategoryTabs = ({
  categories,
  activeCategory,
  onChange,
  onViewAll,
}: MedicineCategoryTabsProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex flex-wrap items-center gap-4">
      {categories.map((category) => (
        <button
          key={category.key}
          type="button"
          onClick={() => onChange(category.key)}
          className={[
            "text-sm sm:text-base font-semibold pb-2 border-b-2 transition-colors",
            category.key === activeCategory.key
              ? "text-dark border-primary"
              : "text-slate-500 border-transparent hover:text-dark",
          ].join(" ")}
        >
          {category.label}
        </button>
      ))}
    </div>

    <CustomButton
      variant="primary"
      size="xs"
      radius="xs"
      onClick={() => onViewAll?.(activeCategory)}
    >
      View All
    </CustomButton>
  </div>
);

export default MedicineCategoryTabs;
