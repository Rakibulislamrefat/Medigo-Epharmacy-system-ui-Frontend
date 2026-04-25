import { Icons } from "../../../shared/icons/Icons";
import CustomButton from "../../../shared/button/CustomButton";
import type { MedicineProduct } from "../service/MedicineCategory.types";

type MedicineCardProps = {
  product: MedicineProduct;
  onAddToBag?: () => void;
};

const MedicineCard = ({ product, onAddToBag }: MedicineCardProps) => (
  <div className="w-[190px] bg-white border border-gray-100 rounded-xs overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <div className="relative h-28 bg-white center-flex">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="max-h-24 max-w-[160px] object-contain"
        loading="lazy"
      />
    </div>

    <div className="px-3 pb-3">
      <p className="text-[11px] font-semibold text-slate-800 leading-snug line-clamp-2 min-h-[32px]">
        {product.name}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-black text-primary">৳{product.price}</span>
      </div>
      <div className="mt-2">
        <CustomButton
          variant="outline"
          size="xs"
          radius="xs"
          fullWidth
          leftIcon={<Icons.Cart className="!w-4 !h-4" />}
          onClick={onAddToBag}
        >
          Add to Bag
        </CustomButton>
      </div>
    </div>
  </div>
);

export default MedicineCard;
