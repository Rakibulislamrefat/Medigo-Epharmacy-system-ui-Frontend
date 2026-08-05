export type SpecialOffer = {
  id: number;
  image: string;
  title: string;
  discount: string;
  description: string;
  code: string;
  expiry: string;
};

export const offers: SpecialOffer[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1580281657521-ff71aa1b933d?w=600",
    title: "Wellness Essentials",
    discount: "15% OFF",
    description:
      "Save on vitamins, supplements, and daily wellness items for every family member.",
    code: "WELLNESS15",
    expiry: "This week only",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600",
    title: "Prescription Advantage",
    discount: "Free Delivery",
    description:
      "Enjoy free home delivery on prescription refills over $50.",
    code: "HOMEDELIVERY",
    expiry: "Ends month-end",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1549068109-0ec05d9d59ec?w=600",
    title: "Family Care Pack",
    discount: "10% OFF",
    description:
      "Get 10% off family health packs including first aid and OTC essentials.",
    code: "FAMILYCARE",
    expiry: "Valid today",
  },
];
