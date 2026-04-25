import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading, { SectionParagraph } from "../../../shared/section-heading/SectionHeading";

const policyCards = [
  {
    title: "Order issues",
    description:
      "If you receive the wrong item, damaged packaging, or missing products, contact us within 24 hours of delivery.",
    Icon: Icons.AlertCircle,
  },
  {
    title: "Prescription medicines",
    description:
      "For safety and compliance, prescription medicines are not returnable once delivered (unless incorrect/damaged).",
    Icon: Icons.Prescription,
  },
  {
    title: "Non‑prescription items",
    description:
      "Eligible OTC items may be returnable if sealed and unused. We’ll confirm eligibility during support call.",
    Icon: Icons.Check,
  },
  {
    title: "Refund timeline",
    description:
      "Approved refunds are processed after verification and may take 3–7 business days depending on payment method.",
    Icon: Icons.Clock,
  },
];

export default function ReturnPolicyPage() {
  return (
    <SectionContainer>
      <MainContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <SectionHeading
              title="Return Policy"
              description="Clear and safety-first return rules for Medigo e‑Pharmacy orders."
              align="left"
            />
            <SectionParagraph className="mt-3">
              Because medicines affect health, returns follow strict rules. If
              something goes wrong, we’ll make it right quickly based on
              verification.
            </SectionParagraph>

            <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary text-white p-6 shadow-lg shadow-primary/10 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-[30px]" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-[40px]" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center border border-white/10">
                    <Icons.Shield className="!w-6 !h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">
                      Safety & compliance
                    </p>
                    <p className="text-xs text-white/70">
                      Returns are verified to protect patients
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-white/10 border border-white/10 p-4">
                  <div className="flex items-start gap-3">
                    <Icons.Phone className="!w-5 !h-5 text-white mt-0.5" />
                    <div>
                      <p className="text-sm font-black">Need help?</p>
                      <p className="text-xs text-white/70 mt-1">
                        Contact support with your order details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <a href="/contact" className="block">
                    <CustomButton
                      variant="secondary"
                      size="md"
                      radius="xs"
                      fullWidth
                      rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                    >
                      Contact Support
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
                    Key points
                  </p>
                  <div className="text-xs text-slate-500">Simple summary</div>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {policyCards.map(({ title, description, Icon }) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-gray-100 bg-light p-5 hover:bg-white hover:shadow-md transition"
                    >
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 center-flex">
                        <Icon className="!w-6 !h-6 text-primary" />
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
                        What to share with support
                      </p>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                        Order number, item name, photos (if damaged), and your
                        preferred resolution (replacement/refund).
                      </p>
                      <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                        <a href="/request-order" className="sm:flex-1">
                          <CustomButton
                            variant="outline"
                            size="sm"
                            radius="xs"
                            fullWidth
                            leftIcon={<Icons.Cart className="!w-4 !h-4" />}
                          >
                            Request Order
                          </CustomButton>
                        </a>
                        <a href="/special/offer" className="sm:flex-1">
                          <CustomButton
                            variant="outline"
                            size="sm"
                            radius="xs"
                            fullWidth
                            leftIcon={<Icons.Star className="!w-4 !h-4" />}
                          >
                            Special Offers
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

