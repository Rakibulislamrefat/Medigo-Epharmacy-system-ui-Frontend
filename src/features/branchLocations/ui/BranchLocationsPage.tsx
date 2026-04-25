import { useMemo, useState } from "react";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import {
  branchLocations,
  type BranchLocation,
} from "../service/branchLocationsData";

const BranchCard = ({ branch }: { branch: BranchLocation }) => {
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    branch.mapQuery,
  )}`;

  return (
    <div className="group bg-white rounded-xs border border-gray-100 shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xs bg-primary/10 center-flex border border-primary/15">
                <Icons.Location className="!w-5 !h-5 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-dark truncate">
                {branch.name}
              </h3>
            </div>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {branch.address}
            </p>
          </div>

          <span className="shrink-0 text-xxs font-black px-3 py-1 rounded-full bg-secondary/15 text-secondary">
            {branch.city}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2.5 rounded-xs border border-gray-100 bg-light px-3 py-2">
            <Icons.Phone className="!w-4 !h-4 text-primary mt-0.5" />
            <div className="min-w-0">
              <p className="text-xxs font-black tracking-wide text-slate-500">
                PHONE
              </p>
              <p className="text-sm font-semibold text-dark truncate">
                {branch.phone}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xs border border-gray-100 bg-light px-3 py-2">
            <Icons.Email className="!w-4 !h-4 text-primary mt-0.5" />
            <div className="min-w-0">
              <p className="text-xxs font-black tracking-wide text-slate-500">
                EMAIL
              </p>
              <p className="text-sm font-semibold text-dark truncate">
                {branch.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xs border border-gray-100 bg-light px-3 py-2 sm:col-span-2">
            <Icons.Clock className="!w-4 !h-4 text-primary mt-0.5" />
            <div className="min-w-0">
              <p className="text-xxs font-black tracking-wide text-slate-500">
                HOURS
              </p>
              <p className="text-sm font-semibold text-dark truncate">
                {branch.hours}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {branch.tags.map((t) => (
            <span
              key={t}
              className="text-xxs font-black px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/10"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col xs:flex-row gap-3">
          <a className="w-full xs:w-auto" href={directionsUrl} target="_blank" rel="noreferrer">
            <CustomButton variant="primary" size="sm" radius="xs" fullWidth>
              Get Directions
            </CustomButton>
          </a>
          <CustomButton
            variant="outline"
            size="sm"
            radius="xs"
            fullWidth
            rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
          >
            Contact Branch
          </CustomButton>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-80" />
    </div>
  );
};

const BranchLocationsPage = () => {
  const cities = useMemo(() => {
    const set = new Set(branchLocations.map((b) => b.city));
    return ["All", ...Array.from(set)];
  }, []);

  const [city, setCity] = useState<string>("All");

  const filtered = useMemo(() => {
    if (city === "All") return branchLocations;
    return branchLocations.filter((b) => b.city === city);
  }, [city]);

  return (
    <SectionContainer>
      <MainContainer>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            title="Branch Locations"
            description="Find the nearest branch and get directions instantly. We’re open daily and ready to help."
            align="left"
            className="max-w-2xl"
          />

          <div className="flex flex-wrap items-center gap-2">
            {cities.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCity(c)}
                className={[
                  "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
                  c === city
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-dark border-gray-200 hover:border-primary hover:text-primary",
                ].join(" ")}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default BranchLocationsPage;
