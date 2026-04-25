import { useState } from "react";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import CustomButton from "../../../shared/button/CustomButton";
import ToggleIcon from "../../../shared/button/CustomToggle";
import { Icons } from "../../../shared/icons/Icons";

const faqs = [
  {
    question: "Do I need a prescription to order medicines?",
    answer:
      "Prescription (Rx) medicines require a valid doctor's prescription before we can process your order. You can upload a photo or scanned copy during checkout. OTC (over-the-counter) products can be ordered without a prescription.",
  },
  {
    question: "How do I upload my prescription?",
    answer:
      "After adding Rx items to your cart, you will be prompted to upload your prescription. Go to 'Upload Prescription' from your account dashboard or the checkout page, take a clear photo of the original prescription, and submit. Our pharmacists verify it within 30 minutes.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "We offer express delivery within 4–6 hours for orders placed before 8 PM inside Dhaka city. Orders outside Dhaka are delivered within 1–2 business days. You will receive real-time tracking updates via SMS and email.",
  },
  {
    question: "Are the medicines genuine and quality-assured?",
    answer:
      "Yes. We source all medicines directly from licensed manufacturers and authorized distributors. Every product is stored in temperature-controlled conditions and passes our quality check before dispatch.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept bKash, Nagad, Rocket, Visa/Mastercard (credit & debit), and cash on delivery. All online transactions are secured with SSL encryption.",
  },
  {
    question: "Can I return or exchange a medicine?",
    answer:
      "Returns are accepted within 48 hours of delivery if the product is unopened, undamaged, and not a temperature-sensitive item. Prescription medicines are non-returnable once dispensed. Please contact our support team to initiate a return.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Once your order is confirmed, you will receive an SMS and email with a tracking link. You can also go to 'My Orders' in your account dashboard to view real-time delivery status.",
  },
  {
    question: "Is my personal and medical data kept private?",
    answer:
      "Absolutely. Your prescriptions, health data, and personal details are encrypted and never shared with third parties. We comply with applicable data protection regulations. Read our Privacy Policy for full details.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SectionContainer>
      <MainContainer>
        {/* Heading */}
        <SectionHeading
          title="Frequently Asked Questions"
          description="Everything you need to know about ordering medicines and using Medigo Pharma."
          align="center"
          className="mb-10 sm:mb-14"
        />

        {/* Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-xl border-2 overflow-hidden transition-all duration-200
                  ${isOpen ? "border-primary/30" : "border-gray-100"}`}
              >
                {/* Question row */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-primary/5 transition-colors duration-200"
                >
                  <span
                    className={`font-semibold text-sm sm:text-base pr-4 leading-snug
                      ${isOpen ? "text-primary" : "text-dark"}`}
                  >
                    {faq.question}
                  </span>

                  <ToggleIcon isOpen={isOpen} icon={<Icons.Arrow />} />
                </button>

                {/* Answer */}
                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="mt-10 max-w-3xl mx-auto rounded-2xl bg-gradient-to-r from-primary/25 via-secondary/20 to-primary/25 p-[1px] shadow-lg shadow-primary/5">
          <div className="rounded-2xl bg-[#eef9f6] border border-primary/10 p-7 sm:p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-white border border-primary/15 center-flex shadow-sm shadow-primary/10">
              <Icons.Mail className="!w-6 !h-6 text-primary" />
            </div>
            <p className="mt-4 font-serif font-semibold text-dark text-lg">
              Still have questions?
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Our pharmacy support team is available every day from 8 AM to 10 PM.
            </p>
            <div className="mt-6 flex justify-center">
              <a href="/contact-us" className="w-full sm:w-auto">
                <CustomButton
                  variant="primary"
                  size="md"
                  radius="full"
                  fullWidth
                  rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                >
                  Contact Us
                </CustomButton>
              </a>
            </div>
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default FAQ;
