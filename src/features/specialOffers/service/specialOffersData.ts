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
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600",
    title: "Early Bird Special",
    discount: "25% OFF",
    description: "Book 30 days in advance and save up to 25% on your stay",
    code: "EARLY25",
    expiry: "Limited Time",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600",
    title: "Couple Package",
    discount: "Free Dinner",
    description:
      "Complimentary romantic dinner for two with every weekend booking",
    code: "ROMANCE",
    expiry: "Weekends Only",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600",
    title: "Family Getaway",
    discount: "Kids Stay Free",
    description: "Children under 12 stay free in existing beds",
    code: "FAMILY",
    expiry: "Year Round",
  },
];
