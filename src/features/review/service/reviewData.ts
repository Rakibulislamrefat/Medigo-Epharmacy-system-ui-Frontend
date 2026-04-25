export type ReviewItem = {
  id: number;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  title: string;
  message: string;
  dateLabel: string;
  verified?: boolean;
};

export const reviews: ReviewItem[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "New York, USA",
    avatar:
      "https://plus.unsplash.com/premium_photo-1661440052048-48f37620b3ae?w=200",
    rating: 5,
    title: "Fast delivery and genuine products",
    message:
      "Ordered prescription medicine and received it the same day. Packaging was sealed and everything looked authentic.",
    dateLabel: "2 days ago",
    verified: true,
  },
  {
    id: 2,
    name: "James Chen",
    location: "Singapore",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    rating: 5,
    title: "Smooth experience",
    message:
      "Very easy to upload prescription and place an order. Support team was responsive and helpful.",
    dateLabel: "1 week ago",
    verified: true,
  },
  {
    id: 3,
    name: "Emma Wilson",
    location: "London, UK",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    rating: 4,
    title: "Great service",
    message:
      "Delivery was on time and items were well packed. Would love to see more offers on diabetic care items.",
    dateLabel: "2 weeks ago",
    verified: true,
  },
  {
    id: 4,
    name: "Arif Rahman",
    location: "Dhaka, Bangladesh",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200",
    rating: 5,
    title: "Reliable and quick",
    message:
      "Got my OTC items quickly and the branch pickup option was convenient. Highly recommended.",
    dateLabel: "3 weeks ago",
    verified: true,
  },
  {
    id: 5,
    name: "Nadia Islam",
    location: "Chattogram, Bangladesh",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200",
    rating: 4,
    title: "Good packaging",
    message:
      "Everything arrived safe. App UI is clean and easy to use. A few items were out of stock but support suggested alternatives.",
    dateLabel: "1 month ago",
    verified: false,
  },
  {
    id: 6,
    name: "Rahul Das",
    location: "Sylhet, Bangladesh",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200",
    rating: 5,
    title: "Best online pharmacy experience",
    message:
      "Loved the fast checkout and the clear updates. Will order again for my family’s regular needs.",
    dateLabel: "1 month ago",
    verified: true,
  },
];
