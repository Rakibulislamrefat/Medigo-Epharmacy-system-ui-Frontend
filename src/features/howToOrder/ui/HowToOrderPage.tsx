import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading, { SectionParagraph } from "../../../shared/section-heading/SectionHeading";

const steps = [
  {
    title: "Search & select",
    description:
      "Search medicines or list the items you need. For prescription items, upload a prescription.",
    Icon: Icons.Search,
  },
  {
    title: "Request order",
    description:
      "Submit a request with quantity and delivery details. Our team checks stock and pricing.",
    Icon: Icons.Cart,
  },
  {
    title: "Pharmacist verification",
    description:
      "For prescription medicines, we verify the prescription and confirm substitutes if needed.",
    Icon: Icons.Shield,
  },
  {
    title: "Confirm & deliver",
    description:
      "We call to confirm total price and delivery time, then deliver to your doorstep.",
    Icon: Icons.Delivery,
  },
];

const tips = [
  {
    title: "Use a clear prescription",
    description: "A readable photo/PDF helps faster verification.",
    Icon: Icons.Prescription,
  },
  {
    title: "Add notes if needed",
    description: "Mention brand preference or time window for delivery.",
    Icon: Icons.Time,
  },
  {
    title: "Keep your phone active",
    description: "We may call to confirm availability and pricing.",
    Icon: Icons.Phone,
  },
];

export default function HowToOrderPage() {
  return (
    <SectionContainer>
      <MainContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <SectionHeading
              title="How to Order"
              description="Order medicine easily from Medigo e‑Pharmacy — verified, confirmed, and delivered fast."
              align="left"
            />
            <SectionParagraph className="mt-3">
              You can request an order by listing medicine items, or upload a
              prescription for prescription medicines. We’ll confirm pricing and
              availability before dispatch.
            </SectionParagraph>

            <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary text-white p-6 shadow-lg shadow-primary/10 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-[30px]" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-[40px]" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center border border-white/10">
                    <Icons.Pill className="!w-6 !h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">
                      Medigo e‑Pharmacy
                    </p>
                    <p className="text-xs text-white/70">
                      Quick guide for ordering
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  {tips.map(({ title, description, Icon }) => (
                    <div
                      key={title}
                      className="rounded-xl bg-white/10 border border-white/10 p-4 flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/15 center-flex shrink-0">
                        <Icon className="!w-5 !h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black">{title}</p>
                        <p className="text-xs text-white/70 mt-1">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                  <a href="/request-order" className="sm:flex-1">
                    <CustomButton
                      variant="secondary"
                      size="md"
                      radius="xs"
                      fullWidth
                      rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                    >
                      Request Order
                    </CustomButton>
                  </a>
                  <a href="/prescription/history" className="sm:flex-1">
                    <CustomButton
                      variant="outline"
                      size="md"
                      radius="xs"
                      fullWidth
                      leftIcon={<Icons.Prescription className="!w-4 !h-4" />}
                    >
                      Upload Prescription
                    </CustomButton>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-gradient-to-r from-primary/25 via-secondary/20 to-primary/25 p-[1px] shadow-lg shadow-primary/5">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xxs font-black tracking-[0.2em] uppercase text-primary">
                    Steps
                  </p>
                  <div className="text-xs text-slate-500">
                    Simple process, quick confirmation
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {steps.map(({ title, description, Icon }, idx) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-gray-100 bg-light p-5 hover:bg-white hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 center-flex shrink-0">
                          <Icon className="!w-6 !h-6 text-primary" />
                        </div>
                        <span className="text-xs font-black text-primary/70">
                          0{idx + 1}
                        </span>
                      </div>
                      <p className="mt-4 text-sm font-black text-dark">
                        {title}
                      </p>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <Icons.Check className="!w-5 !h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-black text-dark">
                        Need help choosing?
                      </p>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                        If you’re unsure about medicine name/strength, upload a
                        prescription. We’ll verify and confirm before delivery.
                      </p>
                      <div className="mt-4">
                        <a href="/special/offer">
                          <CustomButton
                            variant="outline"
                            size="sm"
                            radius="xs"
                            leftIcon={<Icons.Star className="!w-4 !h-4" />}
                          >
                            View Special Offers
                          </CustomButton>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  );
}

