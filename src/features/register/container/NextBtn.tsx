import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";

export function NavBtns({
  onNext,
  onBack,
  nextLabel = "Continue →",
  showBack = true,
  disabled = false,
}: {
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  showBack?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col xs:flex-row gap-3 mt-7">
      {showBack && onBack && (
        <CustomButton
          variant="outline"
          size="md"
          radius="xs"
          fullWidth
          onClick={onBack}
          leftIcon={<Icons.ArrowBack className="!w-4 !h-4" />}
        >
          Back
        </CustomButton>
      )}
      <CustomButton
        variant="primary"
        size="md"
        radius="xs"
        fullWidth
        onClick={onNext}
        disabled={disabled}
        rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
      >
        {nextLabel}
      </CustomButton>
    </div>
  );
}
