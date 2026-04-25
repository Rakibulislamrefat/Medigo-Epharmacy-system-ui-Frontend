export type BranchLocation = {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  hours: string;
  mapQuery: string;
  tags: string[];
};

export const branchLocations: BranchLocation[] = [
  {
    id: 1,
    name: "Dhaka Central Branch",
    address: "Level 5, House 21, Road 7, Dhanmondi, Dhaka 1209",
    city: "Dhaka",
    phone: "01319-864049",
    email: "lazzcorporate@gmail.com",
    hours: "10:00 AM – 10:00 PM",
    mapQuery: "Dhanmondi Road 7 Dhaka",
    tags: ["Prescription", "OTC", "Delivery"],
  },
  {
    id: 2,
    name: "Chattogram Branch",
    address: "Plot 12, CDA Avenue, GEC Circle, Chattogram",
    city: "Chattogram",
    phone: "01319-864049",
    email: "lazzcorporate@gmail.com",
    hours: "10:00 AM – 10:00 PM",
    mapQuery: "GEC Circle Chattogram",
    tags: ["Surgical", "Diabetic Care", "Pickup"],
  },
  {
    id: 3,
    name: "Sylhet Branch",
    address: "Zindabazar Main Road, Sylhet",
    city: "Sylhet",
    phone: "01319-864049",
    email: "lazzcorporate@gmail.com",
    hours: "10:00 AM – 10:00 PM",
    mapQuery: "Zindabazar Sylhet",
    tags: ["Prescription", "24/7 Support"],
  },
  {
    id: 4,
    name: "Rajshahi Branch",
    address: "Shaheb Bazar, Rajshahi",
    city: "Rajshahi",
    phone: "01319-864049",
    email: "lazzcorporate@gmail.com",
    hours: "10:00 AM – 10:00 PM",
    mapQuery: "Shaheb Bazar Rajshahi",
    tags: ["OTC", "Delivery"],
  },
];
