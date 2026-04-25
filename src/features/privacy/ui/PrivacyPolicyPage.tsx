import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading, { SectionParagraph } from "../../../shared/section-heading/SectionHeading";

const blocks = [
  {
    title: "What we collect",
    description:
      "Basic details like name, phone, email, and delivery address. For prescription orders, you may upload prescription images/PDFs.",
    Icon: Icons.Mail,
  },
  {
    title: "Why we collect it",
    description:
      "To confirm orders, verify prescriptions, deliver medicines, provide support, and improve service quality.",
    Icon: Icons.Shield,
  },
  {
    title: "How we protect it",
    description:
      "We apply access controls and only use your data for legitimate service needs. We never sell personal data.",
    Icon: Icons.Check,
  },
  {
    title: "Your choices",
    description:
      "You can request updates to your details and ask questions about how your information is used.",
    Icon: Icons.User,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <SectionContainer>
      <MainContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <SectionHeading
              title="Privacy Policy"
              description="How Medigo e‑Pharmacy collects and uses information to deliver your orders safely."
              align="left"
            />
            <SectionParagraph className="mt-3">
              We respect privacy and handle data responsibly. This page provides
              a clear overview of what we collect, why we collect it, and how we
              protect it.
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
                      Privacy-first service
                    </p>
                    <p className="text-xs text-white/70">
                      Only used for order and support
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-white/10 border border-white/10 p-4">
                  <div className="flex items-start gap-3">
                    <Icons.Prescription className="!w-5 !h-5 text-white mt-0.5" />
                    <div>
                      <p className="text-sm font-black">Prescription files</p>
                      <p className="text-xs text-white/70 mt-1 leading-relaxed">
                        Uploaded prescriptions are used only for verification and
                        order fulfillment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                  <a href="/contact" className="sm:flex-1">
                    <CustomButton
                      variant="secondary"
                      size="md"
                      radius="xs"
                      fullWidth
                      rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                    >
                      Contact Us
                    </CustomButton>
                  </a>
                  <a href="/termsCondition" className="sm:flex-1">
                    <CustomButton
                      variant="outline"
                      size="md"
                      radius="xs"
                      fullWidth
                      leftIcon={<Icons.Check className="!w-4 !h-4" />}
                    >
                      Terms & Conditions
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
                    Overview
                  </p>
                  <div className="text-xs text-slate-500">
                    Clear and simple
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {blocks.map(({ title, description, Icon }) => (
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
                    <Icons.AlertCircle className="!w-5 !h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-black text-dark">
                        Questions or requests
                      </p>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                        For privacy-related questions or to request updates to
                        your information, contact support.
                      </p>
                      <div className="mt-4">
                        <a href="/contact">
                          <CustomButton variant="outline" size="sm" radius="xs">
                            Contact Support
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

