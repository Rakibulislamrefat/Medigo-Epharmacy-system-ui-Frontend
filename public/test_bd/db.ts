export interface NavChildItem {
  name: string;
  url?: string;
  icon?: string;
  children?: NavChildItem[];
}
export interface CategoryimgItem {
  title: string;
  image: string;
}

// Main navigation type
export interface NavigationItem {
  name: string;
  url: string;
  icon?: string;
  children?: NavChildItem[];
}

const banners = [
  {
    id: 1,
    // url: "https://cdn.globus.pictures/fr/public/3456/1940/502f9241b130a44688f9a7ca7253094e423050992eb47c18923d6d10a2728f0d.jpeg?h=1078&w=1920",
    url: "https://i.ibb.co.com/qFJ8gH8w/Whats-App-Image-2025-12-24-at-16-51-13.jpg",
    title: "Purchase premium furniture from Hi Fashion",
    desc: "Furnishing interiors for life and business with savings of up to 70%",
    page: "home",
  },
];

export { banners };

export const navigation: NavigationItem[] = [
  {
    name: "catalogue",
    url: "/catalogue",
    children: [
      // -----------------------------------
      // 1. Sofas & Armchairs
      // -----------------------------------
      {
        name: "Sofas & armchairs",
        icon: "Sofa",
        url: "/catalogue/sofas-armchairs",
        children: [
          {
            name: "Sofas",
            children: [
              // { name: "Straight sofas" },
              // { name: "Corner sofas" },
              // { name: "Modular sofas" },
              // { name: "Semi-circular sofas" },
              // { name: "U-shaped sofas" },
              // { name: "Reclining sofas" },
              // { name: "Sofa beds" },

              // ✅ added
              { name: "Sofa set (Victorian)" },
              { name: "Sofa set (Recliner)" },
              { name: "Sofa set (U-Shape)" },
              { name: "Sofa set (L-Shape)" },
              { name: "Office sofa set" },
            ],
          },
          // {
          //   name: "Armchairs & poufs",
          //   children: [
          //     { name: "Armchairs" },
          //     { name: "Poufs" },
          //     { name: "Ottomans" },
          //     { name: "Benches" },
          //     { name: "Rocking chairs" },
          //     { name: "Reclining armchairs" },
          //     { name: "Hanging chairs" },
          //     { name: "Massage chairs" },
          //     { name: "Bean bag chairs" },
          //   ],
          // },
        ],
      },

      // -----------------------------------
      // 2. Beds & Mattresses
      // -----------------------------------
      {
        name: "Beds & mattresses",
        icon: "Bed",
        url: "/catalogue/beds-mattresses",
        children: [
          {
            name: "Beds",
            children: [
              // { name: "Single beds" },
              // { name: "Double beds" },
              // { name: "Queen beds" },
              // { name: "King beds" },
              // { name: "Storage beds" },
              // { name: "Sofa beds" },

              // ✅ added
              { name: "Bedroom set (Master)" },
              { name: "Single bed set" },
            ],
          },
   
        ],
      },

      // -----------------------------------
      // 3. Cabinets & Storage
      // -----------------------------------
      {
        name: "Cabinets & storage",
        icon: "Archive",
        url: "/catalogue/cabinets-storage",
        children: [
          {
            name: "Storage",
            children: [
              // { name: "Wardrobes" },
              // { name: "Dressers" },
              // { name: "Storage cabinets" },
              // { name: "Sideboards" },
              // { name: "Bookshelves" },
              // { name: "TV units" },

              // ✅ added
              { name: "Show case / Cellerate" },
              { name: "T.V cabinet" },
              { name: "T.V stand" },
              { name: "Console" },
            ],
          },
          {
            name: "Office storage",
            children: [
              // { name: "Filing cabinets" },
              // { name: "Drawer units" },
              // { name: "Document organizers" },

              // ✅ added
              { name: "Office cabinet" },
              { name: "Safe locker" },
              { name: "Industries locker" },
            ],
          },
        ],
      },

      // -----------------------------------
      // 4. Tables & Chairs
      // -----------------------------------
      {
        name: "Tables & chairs",
        icon: "Table",
        url: "/catalogue/tables-chairs",
        children: [
          {
            name: "Tables",
            children: [
              // { name: "Dining tables" },
              // { name: "Coffee tables" },
              // { name: "Side tables" },
              // { name: "Computer tables" },
              // { name: "Study desks" },

              // ✅ added
              { name: "Dining table set (12 seater) - Marble top" },
              { name: "Dining table set (10 seater)" },
              { name: "Dining table set (08 seater)" },
              {
                name: "Dining set (Benly / Nova / Arsenal / Aura / Imperial / New Sufir)",
              },
              { name: "Coffee table / Center table" },
              { name: "Side table" },
            ],
          },
          // {
          //   name: "Chairs",
          //   children: [
          //     { name: "Dining chairs" },
          //     { name: "Office chairs" },
          //     { name: "Recliners" },
          //     { name: "Stools" },
          //     { name: "Bar chairs" },
          //   ],
          // },
        ],
      },

      // -----------------------------------
      // 5. Children’s room
      // -----------------------------------
      {
        name: "Children’s room",
        icon: "Baby",
        url: "/catalogue/children",
        children: [
          {
            name: "Kids furniture",
            children: [
              // { name: "Kids beds" },
              // { name: "Kids tables" },
              // { name: "Kids chairs" },
              // { name: "Toy storage" },
              // { name: "Study desks" },

              // ✅ added
              { name: "Baby bedroom set" },
              { name: "Single baby bed" },
            ],
          },
          // {
          //   name: "Decoration",
          //   children: [
          //     { name: "Wall decor" },
          //     { name: "Lighting" },
          //     { name: "Rugs" },
          //   ],
          // },
        ],
      },

      // -----------------------------------
      // 6. Corporate Furniture
      // -----------------------------------
      {
        name: "Workstation furniture",
        icon: "Building2",
        url: "/catalogue/corporate",
        children: [
          {
            name: "Office desks",
            children: [
              // { name: "Executive desks" },
              // { name: "Workstations" },
              // { name: "Standing desks" },

              // ✅ added
              { name: "Conference table" },
              { name: "Workstation" },
              { name: "Boss table" },
              { name: "Executive table desk" },
            ],
          },
          {
            name: "Office seating",
            children: [
              // { name: "Ergonomic chairs" },
              // { name: "Visitor chairs" },
              // { name: "Conference chairs" },

              // ✅ added
              { name: "Boss revolving chair" },
              { name: "Revolving chair" },
              { name: "Visitor chair" },
            ],
          },
        ],
      },

      // -----------------------------------
      // 7. Outdoors
      // -----------------------------------
      // {
      //   name: "Outdoors",
      //   icon: "TreePine",
      //   url: "/catalogue/outdoors",
      //   children: [
      //     {
      //       name: "Outdoor seating",
      //       children: [
      //         { name: "Outdoor sofas" },
      //         { name: "Outdoor chairs" },
      //         { name: "Hammocks" },
      //         { name: "Garden benches" },
      //       ],
      //     },
      //     {
      //       name: "Outdoor tables",
      //       children: [
      //         { name: "Patio tables" },
      //         { name: "Coffee tables" },
      //         { name: "Folding tables" },
      //       ],
      //     },
      //   ],
      // },

      // -----------------------------------
      // 8. Home décor (✅ added for remaining items)
      // -----------------------------------
      {
        name: "Lighting & accessories",
        icon: "Lamp",
        url: "/catalogue/lighting-accessories",
        children: [
          {
            name: "Lighting",
            children: [
              { name: "Chandelier (Hanging)" },
              { name: "Chandelier (Ceiling)" },
              { name: "Floor lamp" },
              { name: "Side table lamp" },
            ],
          },
          {
            name: "Decorative accessories",
            children: [
              { name: "Floor flower stand" },
              { name: "Flower vase" },
              { name: "Aquarium" },
              { name: "Fire place / Fire box heater / Animation" },
            ],
          },
        ],
      },
      {
        name: "Wall décor & home textiles",
        icon: "Frame",
        url: "/catalogue/wall-textiles",
        children: [
          {
            name: "Wall & table décor",
            children: [
              { name: "Wall clock" },
              { name: "Table clock" },
              { name: "Turkish painting / frame / clock / show piece" },
              { name: "Console" },
            ],
          },
          {
            name: "Textiles",
            children: [{ name: "Carpet" }, { name: "Bed sheet / Bed cover" }],
          },
        ],
      },
    ],
  },

  {
    name: "home",
    url: "/",
  },

  {
    name: "projects",
    url: "/projects",
  },

  {
    name: "About Us",
    url: "/about",
  },

  {
    name: "contact",

    url: "/contact",
  },
  {
    name: "CSR",

    url: "/csr",
  },
];

export const categoryimg: CategoryimgItem[] = [
  {
    title: "Sofas & armchairs",
    image:
      "https://cdn.globus.pictures/fr/public/2460/2460/d7bde3f28d603482fb2f50dc7804b2321710ad34f83c47812ccf44ebc03eb839.jpeg?h=498&w=1024",
  },
  {
    title: "Beds & mattresses",
    image:
      "https://cdn.globus.pictures/fr/public/2460/1194/5a198bbd3ad0064bf6aeb2fe89f3189b69169bfa07f72383311d3490f89a76d6.jpeg?h=498&w=1024",
  },
  {
    title: "Cabinets & storage",
    image:
      "https://cdn.globus.pictures/fr/public/1194/1194/c28fb64cb9850b5839afdb0351128ce995cabc18f6820113b8d8f66cb878e4cc.jpeg?h=640&w=640",
  },
  {
    title: "Tables & chairs",
    image:
      "https://cdn.globus.pictures/fr/public/700/700/d35289ccc0e1a83b3679e1ec46138a996223678e9fd9d126bc46464ada3f2e1f.jpeg?h=640&w=640",
  },
  {
    title: "Children’s room",
    image:
      "https://cdn.globus.pictures/fr/public/1194/1194/fc49fbfdeff0c2e956689df16e34e215249a8d713ef1aac3fbad97f70150a408.jpeg?h=640&w=640",
  },
  {
    title: "Workstation furniture",
    image:
      "https://cdn.globus.pictures/fr/public/2460/2460/511a1bf9d3b5f74f3e3b1722febd65675a010c3ff36328612d06777229086f23.jpeg?h=1024&w=1024",
  },
  {
    title: "Outdoors",
    image:
      "https://cdn.globus.pictures/fr/public/2460/1194/888e22497ebaf6cbd10fbbd24c3af15f73be728507574dd717ce8c146928ae03.jpeg?h=498&w=1024",
  },
  {
    title: "Lighting & accessories",
    image:
      "https://i.ibb.co.com/Kjr021py/Crystal-Chandelier-Retractable-Blade-Ceiling-Light-with-Fan-Gold-42-Inch-4-Blade-1-year-warrant.webp",
  },
  {
    title: "Wall décor & home textiles",
    image: "https://i.ibb.co.com/7xwG2L7W/8f9e8a4124ca4caed1171320184eb9b5.png",
  },
];
