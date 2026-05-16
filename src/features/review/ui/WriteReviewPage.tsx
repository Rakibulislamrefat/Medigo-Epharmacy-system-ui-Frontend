import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import type { RootState } from "../../../redux/store";
import { addReview } from "../service/reviewData";

interface ReviewFormData {
  name: string;
  email: string;
  rating: number;
  title: string;
  message: string;
  orderNumber?: string;
  verified: boolean;
}

const RatingSelector = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }).map((_, i) => {
        const rating = i + 1;
        const filled = rating <= value;
        return (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="p-1 hover:scale-110 transition-transform"
            aria-label={`Rate ${rating} stars`}
          >
            <Icons.Star
              className={[
                "!w-8 !h-8",
                filled ? "text-secondary" : "text-gray-300",
              ].join(" ")}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-sm font-semibold text-dark">
          {value} of 5 stars
        </span>
      )}
    </div>
  );
};

export default function WriteReviewPage() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);

  const [formData, setFormData] = useState<ReviewFormData>({
    name: user?.name || "",
    email: user?.email || "",
    rating: 0,
    title: "",
    message: "",
    orderNumber: "",
    verified: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ReviewFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const e: Partial<Record<keyof ReviewFormData, string>> = {};

    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Please enter a valid email";
    if (formData.rating === 0) e.rating = "Please select a rating";
    if (!formData.title.trim()) e.title = "Review title is required";
    if (!formData.message.trim()) e.message = "Review message is required";
    if (formData.message.trim().length < 20)
      e.message = "Review must be at least 20 characters";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1500));

      addReview({
        name: formData.name,
        location:
          user?.location?.city && user?.location?.country
            ? `${user.location.city}, ${user.location.country}`
            : "Verified Customer",
        avatar: user?.avatar ||
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
        rating: formData.rating,
        title: formData.title,
        message: formData.message,
        verified: formData.verified,
      });

      toast.success("Thank you for your review! It has been added to reviews.");
      setTimeout(() => navigate("/review"), 2000);
    } catch (err) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    [
      "w-full rounded-lg border px-4 py-3 text-sm outline-none transition",
      "bg-white text-dark border-gray-200",
      "focus:border-primary focus:ring-2 focus:ring-primary/20",
      hasError ? "border-danger bg-danger/5 focus:ring-danger/20" : "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <SectionContainer>
      <MainContainer>
        <div className="mb-8 max-w-2xl">
          <SectionHeading
            title="Write a Review"
            description="Share your experience with Medigo E-pharmacy. Your feedback helps us improve our service and assists other customers in making informed decisions."
            align="left"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-4xl">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Your Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                className={inputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="text-xs text-danger mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email"
                className={inputClass(!!errors.email)}
              />
              {errors.email && (
                <p className="text-xs text-danger mt-1">{errors.email}</p>
              )}
            </div>

            {/* Order Number (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Order Number <span className="text-slate-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.orderNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, orderNumber: e.target.value })
                }
                placeholder="e.g., MDG-20260515-A1B2C3"
                className={inputClass(false)}
              />
              <p className="text-xs text-slate-600 mt-1">
                If available, include your order number for verification
              </p>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-4">
                Your Rating <span className="text-danger">*</span>
              </label>
              <RatingSelector
                value={formData.rating}
                onChange={(r) => setFormData({ ...formData, rating: r })}
              />
              {errors.rating && (
                <p className="text-xs text-danger mt-2">{errors.rating}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Review Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Summarize your experience in a few words"
                maxLength={100}
                className={inputClass(!!errors.title)}
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.title.length}/100 characters
              </p>
              {errors.title && (
                <p className="text-xs text-danger mt-1">{errors.title}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Your Review <span className="text-danger">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Share details about your experience. What did you like? What could be improved?"
                maxLength={500}
                rows={6}
                className={[
                  inputClass(!!errors.message),
                  "resize-none",
                ].join(" ")}
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.message.length}/500 characters (minimum 20)
              </p>
              {errors.message && (
                <p className="text-xs text-danger mt-1">{errors.message}</p>
              )}
            </div>

            {/* Verified Checkbox */}
            <div className="flex items-start gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
              <input
                type="checkbox"
                id="verified"
                checked={formData.verified}
                onChange={(e) =>
                  setFormData({ ...formData, verified: e.target.checked })
                }
                className="mt-1"
              />
              <div>
                <label htmlFor="verified" className="text-sm font-semibold text-dark">
                  I have a verified purchase
                </label>
                <p className="text-xs text-slate-600 mt-0.5">
                  Check this if you ordered from us. Your review will be marked as
                  verified.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <CustomButton
                type="submit"
                variant="primary"
                size="md"
                radius="lg"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Review"}
              </CustomButton>
              <CustomButton
                type="button"
                variant="outline"
                size="md"
                radius="lg"
                onClick={() => navigate("/reviews")}
                disabled={loading}
              >
                Cancel
              </CustomButton>
            </div>
          </form>

          {/* Sidebar Info */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm sticky top-24">
              <h3 className="text-base font-black text-dark mb-4">Review Tips</h3>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="text-lg">⭐</div>
                  <div>
                    <p className="text-sm font-semibold text-dark">Be Honest</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Share your genuine experience
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="text-lg">✍️</div>
                  <div>
                    <p className="text-sm font-semibold text-dark">Be Specific</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Mention what worked well or needs improvement
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="text-lg">🎯</div>
                  <div>
                    <p className="text-sm font-semibold text-dark">Be Helpful</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Write for other customers, not the pharmacy
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="text-lg">🚫</div>
                  <div>
                    <p className="text-sm font-semibold text-dark">Avoid</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Profanity, spam, or personal attacks
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs text-slate-600">
                  Your review will be moderated and published within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  );
}
