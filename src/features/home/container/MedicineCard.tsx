import { Icons } from "../../../shared/icons/Icons";
import CustomButton from "../../../shared/button/CustomButton";
import type { MedicineProduct } from "../service/MedicineCategory.types";

type MedicineCardProps = {
  product: MedicineProduct;
  onAddToBag?: () => void;
  isAdding?: boolean;
};

const MedicineCard = ({ product, onAddToBag, isAdding = false }: MedicineCardProps) => (
  <div className="w-[min(72vw,220px)] sm:w-[190px] bg-white border border-gray-100 rounded-xs overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <div className="relative h-28 sm:h-30 bg-white center-flex px-3">
      <img
        src={product.imageUrl || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=640&auto=format&fit=crop"}
        alt={product.name}
        className="max-h-24 w-full max-w-[170px] object-contain"
        loading="lazy"
      />
    </div>

    <div className="px-3 pb-3 sm:px-4 sm:pb-4">
      <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 min-h-[34px] break-words">
        {product.name}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-base font-black text-primary">৳{product.price}</span>
      </div>
      <div className="mt-2">
        <CustomButton
          variant="outline"
          size="xs"
          radius="xs"
          fullWidth
          leftIcon={<Icons.Cart className="!w-4 !h-4" />}
          onClick={onAddToBag}
          loading={isAdding}
          disabled={isAdding}
          className="min-h-9 whitespace-nowrap text-[11px] sm:text-xs"
        >
          {isAdding ? "Adding..." : "Add to Bag"}
        </CustomButton>
      </div>
    </div>
  </div>
);

export default MedicineCard;
