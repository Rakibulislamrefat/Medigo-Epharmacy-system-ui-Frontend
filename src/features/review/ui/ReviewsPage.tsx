import { useMemo, useState } from "react";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import { reviews, type ReviewItem } from "../service/reviewData";

const RatingStars = ({ value }: { value: number }) => {
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < value;
        return (
          <Icons.Star
            key={i}
            className={[
              "!w-4 !h-4",
              filled ? "text-secondary" : "text-gray-200",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
};

const ReviewCard = ({ item }: { item: ReviewItem }) => {
  return (
    <div className="group bg-white rounded-xs border border-gray-100 shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      <div className="p-5 sm:p-6 flex flex-col h-full">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
              <img
                src={item.avatar}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-dark truncate">{item.name}</p>
              <p className="text-xs text-slate-500 truncate">{item.location}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <RatingStars value={item.rating} />
            <p className="mt-1 text-xxs font-semibold text-slate-500">
              {item.dateLabel}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-black text-dark leading-snug">
            {item.title}
          </p>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {item.message}
          </p>
        </div>

        <div className="mt-auto pt-5 flex items-center justify-between gap-3">
          {item.verified ? (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/10 px-3 py-1.5 rounded-full">
              <Icons.Check className="!w-4 !h-4" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
              <Icons.AlertCircle className="!w-4 !h-4" />
              Unverified
            </span>
          )}

          <button
            type="button"
            className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            Helpful <Icons.HandShake className="!w-4 !h-4" />
          </button>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-80" />
    </div>
  );
};

const ReviewsPage = () => {
  const [rating, setRating] = useState<"All" | 5 | 4 | 3 | 2 | 1>("All");

  const summary = useMemo(() => {
    const total = reviews.length;
    const avg =
      total === 0
        ? 0
        : Math.round(
            (reviews.reduce((acc, r) => acc + r.rating, 0) / total) * 10,
          ) / 10;
    const counts = [1, 2, 3, 4, 5].reduce<Record<number, number>>((acc, n) => {
      acc[n] = reviews.filter((r) => r.rating === n).length;
      return acc;
    }, {});
    return { total, avg, counts };
  }, []);

  const filtered = useMemo(() => {
    if (rating === "All") return reviews;
    return reviews.filter((r) => r.rating === rating);
  }, [rating]);

  return (
    <SectionContainer>
      <MainContainer>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            title="Reviews"
            description="Real feedback from customers who ordered prescription & OTC medicine, surgical products, and diabetic care items."
            align="left"
            className="max-w-2xl"
          />

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xs border border-gray-100 bg-white shadow-sm px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xs bg-secondary/15 text-secondary center-flex border border-secondary/15">
                  <Icons.Star className="!w-5 !h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-dark leading-none">
                    {summary.avg} / 5
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {summary.total} reviews
                  </p>
                </div>
              </div>
            </div>

            <CustomButton variant="primary" size="sm" radius="xs">
              Write a Review
            </CustomButton>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-2">
          {(["All", 5, 4, 3, 2, 1] as const).map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => setRating(v)}
              className={[
                "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
                v === rating
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-dark border-gray-200 hover:border-primary hover:text-primary",
              ].join(" ")}
            >
              {v === "All" ? "All" : `${v} Star`}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <ReviewCard key={item.id} item={item} />
          ))}
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default ReviewsPage;
