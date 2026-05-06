import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import MedicineCategoryTabs from "./MedicineCategoryTabs";
import MedicineCategorySlider from "./MedicineCategorySlider";
import type {
  MedicineCategory,
  MedicineCategorySectionProps,
} from "../service/MedicineCategory.types";
import { getMedicinesByCategory } from "../service/medicineCategoryApi";

const MedicineCategorySection = ({
  categories,
  defaultCategoryKey,
  onViewAll,
  onAddToBag,
}: MedicineCategorySectionProps) => {
  const { data: apiCategories } = useQuery({
    queryKey: ["home", "medicineCategories"],
    queryFn: getMedicinesByCategory,
    retry: 1,
  });

  const data: MedicineCategory[] = useMemo(() => {
    if (categories?.length) return categories;
    if (apiCategories?.length) return apiCategories;
    return [
      {
        key: "prescription",
        label: "Prescription Medicine",
        products: [
          {
            id: "p1",
            name: "PRODEP 20 MG Cap FLUOXETINE",
            price: 3.01,
            imageUrl:
              "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=640&auto=format&fit=crop",
          },
          {
            id: "p2",
            name: "VALEX CR 500 MG Tab SODIUM VALPROATE",
            price: 13,
            imageUrl:
              "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=640&auto=format&fit=crop",
          },
          {
            id: "p3",
            name: "DORMICUM 7.5 MG Tab MIDAZOLAM",
            price: 22,
            imageUrl:
              "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=640&auto=format&fit=crop",
          },
          {
            id: "p4",
            name: "SYSTEAR 10ML Eye Drop LUBRICATING",
            price: 250,
            imageUrl:
              "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=640&auto=format&fit=crop",
          },
          {
            id: "p5",
            name: "ARIPRA 10 MG Tab ARIPIPRAZOLE",
            price: 5,
            imageUrl:
              "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=640&auto=format&fit=crop",
          },
          {
            id: "p6",
            name: "MIRAPRO 15 MG Tab MIRTAZAPINE",
            price: 9,
            imageUrl:
              "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=640&auto=format&fit=crop",
          },
        ],
      },
      {
        key: "surgical",
        label: "Surgical Product",
        products: [
          {
            id: "s1",
            name: "Disposable Surgical Gloves (Box)",
            price: 350,
            imageUrl:
              "https://images.unsplash.com/photo-1584744982498-0b3b93b4a27b?w=640&auto=format&fit=crop",
          },
          {
            id: "s2",
            name: "Sterile Gauze Pad (Pack)",
            price: 120,
            imageUrl:
              "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=640&auto=format&fit=crop",
          },
          {
            id: "s3",
            name: "Surgical Mask (50 pcs)",
            price: 180,
            imageUrl:
              "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=640&auto=format&fit=crop",
          },
          {
            id: "s4",
            name: "Bandage Roll",
            price: 60,
            imageUrl:
              "https://images.unsplash.com/photo-1606206873764-fd15e242df52?w=640&auto=format&fit=crop",
          },
        ],
      },
      {
        key: "otc",
        label: "OTC Medicine",
        products: [
          {
            id: "o1",
            name: "Paracetamol 500mg",
            price: 2.5,
            imageUrl:
              "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=640&auto=format&fit=crop",
          },
          {
            id: "o2",
            name: "Oral Rehydration Salts (ORS)",
            price: 15,
            imageUrl:
              "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=640&auto=format&fit=crop",
          },
          {
            id: "o3",
            name: "Antacid Tablet",
            price: 10,
            imageUrl:
              "https://images.unsplash.com/photo-1550572017-edd951aa8f7e?w=640&auto=format&fit=crop",
          },
          {
            id: "o4",
            name: "Cough Syrup",
            price: 95,
            imageUrl:
              "https://images.unsplash.com/photo-1628359355624-855775b15c63?w=640&auto=format&fit=crop",
          },
        ],
      },
      {
        key: "dental-oral",
        label: "Dental & Oral Care",
        products: [
          {
            id: "d1",
            name: "Blood Glucose Test Strips",
            price: 720,
            imageUrl:
              "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=640&auto=format&fit=crop",
          },
          {
            id: "d2",
            name: "Glucometer",
            price: 1450,
            imageUrl:
              "https://images.unsplash.com/photo-1583912268181-73ed9f8d7b88?w=640&auto=format&fit=crop",
          },
          {
            id: "d3",
            name: "Lancets (Pack)",
            price: 190,
            imageUrl:
              "https://images.unsplash.com/photo-1612531385446-f7e7c9dbe9f0?w=640&auto=format&fit=crop",
          },
          {
            id: "d4",
            name: "Insulin Syringe (Pack)",
            price: 220,
            imageUrl:
              "https://images.unsplash.com/photo-1587370560942-ad2a04eabb6d?w=640&auto=format&fit=crop",
          },
        ],
      },
      {
        key: "woman-care",
        label: "Woman Care",
        products: [
          {
            id: "w1",
            name: "Pregnancy Test Kit",
            price: 250,
            imageUrl:
              "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=640&auto=format&fit=crop",
          },
          {
            id: "w2",
            name: "Menstrual Cup",
            price: 150,
            imageUrl:
              "https://images.unsplash.com/photo-1583912268181-73ed9f8d7b88?w=640&auto=format&fit=crop",
          },
        ],
      },
      {
        key: "baby-care",
        label: "Baby Care",
        products: [
          {
            id: "b1",
            name: "Baby Diapers",
            price: 720,
            imageUrl:
              "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=640&auto=format&fit=crop",
          },
          {
            id: "d2",
            name: "Glucometer",
            price: 1450,
            imageUrl:
              "https://images.unsplash.com/photo-1583912268181-73ed9f8d7b88?w=640&auto=format&fit=crop",
          },
          {
            id: "d3",
            name: "Lancets (Pack)",
            price: 190,
            imageUrl:
              "https://images.unsplash.com/photo-1612531385446-f7e7c9dbe9f0?w=640&auto=format&fit=crop",
          },
          {
            id: "d4",
            name: "Insulin Syringe (Pack)",
            price: 220,
            imageUrl:
              "https://images.unsplash.com/photo-1587370560942-ad2a04eabb6d?w=640&auto=format&fit=crop",
          },
        ],
      },
      {
        key: "personal-care",
        label: "Personal Care",
        products: [
          {
            id: "p1",
            name: "Blood Glucose Test Strips",
            price: 720,
            imageUrl:
              "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=640&auto=format&fit=crop",
          },
          {
            id: "p2",
            name: "Glucometer",
            price: 1450,
            imageUrl:
              "https://images.unsplash.com/photo-1583912268181-73ed9f8d7b88?w=640&auto=format&fit=crop",
          },
          {
            id: "p3",
            name: "Lancets (Pack)",
            price: 190,
            imageUrl:
              "https://images.unsplash.com/photo-1612531385446-f7e7c9dbe9f0?w=640&auto=format&fit=crop",
          },
          {
            id: "p4",
            name: "Insulin Syringe (Pack)",
            price: 220,
            imageUrl:
              "https://images.unsplash.com/photo-1587370560942-ad2a04eabb6d?w=640&auto=format&fit=crop",
          },
        ],
      },
      {
        key: "diabetic-care",
        label: "Diabetic Care",
        products: [
          {
            id: "p1",
            name: "Blood Glucose Test Strips",
            price: 720,
            imageUrl:
              "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=640&auto=format&fit=crop",
          },
          {
            id: "p2",
            name: "Glucometer",
            price: 1450,
            imageUrl:
              "https://images.unsplash.com/photo-1583912268181-73ed9f8d7b88?w=640&auto=format&fit=crop",
          },
          {
            id: "p3",
            name: "Lancets (Pack)",
            price: 190,
            imageUrl:
              "https://images.unsplash.com/photo-1612531385446-f7e7c9dbe9f0?w=640&auto=format&fit=crop",
          },
          {
            id: "p4",
            name: "Insulin Syringe (Pack)",
            price: 220,
            imageUrl:
              "https://images.unsplash.com/photo-1587370560942-ad2a04eabb6d?w=640&auto=format&fit=crop",
          },
        ],
      },
    ];
  }, [categories, apiCategories]);

  const [activeKey, setActiveKey] = useState("");

  useEffect(() => {
    if (!data.length) return;
    const first = data[0].key;
    if (defaultCategoryKey && data.some((c) => c.key === defaultCategoryKey)) {
      setActiveKey(defaultCategoryKey);
      return;
    }
    setActiveKey((current) => (current && data.some((c) => c.key === current) ? current : first));
  }, [data, defaultCategoryKey]);

  const activeCategory = data.find((c) => c.key === activeKey) ?? data[0];

  if (!activeCategory) return null;

  return (
    <SectionContainer>
      <MainContainer>
        <MedicineCategoryTabs
          categories={data}
          activeCategory={activeCategory}
          onChange={setActiveKey}
          onViewAll={onViewAll}
        />

        <div className="mt-4 relative">
          <MedicineCategorySlider
            activeCategory={activeCategory}
            onAddToBag={onAddToBag}
          />
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default MedicineCategorySection;
