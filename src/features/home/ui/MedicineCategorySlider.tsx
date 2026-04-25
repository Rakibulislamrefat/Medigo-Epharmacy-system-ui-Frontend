import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Icons } from "../../../shared/icons/Icons";
import type { MedicineCategory, MedicineProduct } from "../service/MedicineCategory.types";
import MedicineCard from "../container/MedicineCard";

type MedicineCategorySliderProps = {
  activeCategory: MedicineCategory;
  onAddToBag?: (product: MedicineProduct, category: MedicineCategory) => void;
};

const MedicineCategorySlider = ({ activeCategory, onAddToBag }: MedicineCategorySliderProps) => {
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Previous"
        className="medigo-category-prev hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 center-flex hover:bg-gray-50"
      >
        <Icons.ArrowBack className="!w-5 !h-5 text-slate-700" />
      </button>
      <button
        type="button"
        aria-label="Next"
        className="medigo-category-next hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 center-flex hover:bg-gray-50"
      >
        <Icons.Arrow className="!w-5 !h-5 text-slate-700" />
      </button>

      <div className="sm:px-12">
        <Swiper
          modules={[Navigation]}
          slidesPerView="auto"
          spaceBetween={16}
          navigation={{
            prevEl: ".medigo-category-prev",
            nextEl: ".medigo-category-next",
          }}
        >
          {activeCategory.products.map((product) => (
            <SwiperSlide key={product.id} style={{ width: "auto" }}>
              <MedicineCard
                product={product}
                onAddToBag={() => onAddToBag?.(product, activeCategory)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default MedicineCategorySlider;
