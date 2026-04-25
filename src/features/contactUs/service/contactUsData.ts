export type ContactChannel = {
  id: string;
  title: string;
  value: string;
  href: string;
  icon:
    | "Phone"
    | "Email"
    | "Location"
    | "Time"
    | "HandShake"
    | "Facebook"
    | "Instagram"
    | "Twitter";
  badge?: string;
};

export type OfficeLocation = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapQuery: string;
};

export const contactChannels: ContactChannel[] = [
  {
    id: "phone",
    title: "Call Support",
    value: "01568093262",
    href: "tel:01568093262",
    icon: "Phone",
    badge: "Fast help",
  },
  {
    id: "email",
    title: "Email Us",
    value: "medigo@gmail.com",
    href: "mailto:medigo@gmail.com",
    icon: "Email",
    badge: "24/7 inbox",
  },
  {
    id: "location",
    title: "Head Office",
    value: "Kalabagan, Dhaka",
    href: "https://www.google.com/maps/search/?api=1&query=Kalabagan%20Dhaka",
    icon: "Location",
    badge: "Visit",
  },
  {
    id: "hours",
    title: "Support Hours",
    value: "Everyday • 8:00 AM – 10:00 PM",
    href: "#hours",
    icon: "Time",
  },
];

export const officeLocations: OfficeLocation[] = [
  {
    id: "hq",
    name: "Medigo Center (HQ)",
    address: "63/C, Lake Circus, Kalabagan, West Panthapath, Dhaka",
    phone: "01568093262",
    email: "medigo@gmail.com",
    hours: "Everyday • 8:00 AM – 10:00 PM",
    mapQuery:
      "Medigo Center, Road Number 12 , Uttara Sector 10,Dhaka",
  },
];

