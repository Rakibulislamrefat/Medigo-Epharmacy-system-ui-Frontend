import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavLink, useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import { SectionParagraph } from "../../../shared/section-heading/SectionHeading";
import { getMedicinesByCategory } from "../../home/service/medicineCategoryApi";
import { defaultMedicineCatalog } from "../../home/service/medicineCatalog";
import { addProductToCart } from "../../cart/service/cartApi";

type MedicineProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

type CategoryPageProps = {
  mode?: "category" | "all";
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");


const priceTag = (value: number) => `৳${value.toFixed(1)}`;
const isMongoId = (value: string) => /^[a-f\d]{24}$/i.test(value);

const getErrorMessage = (err: unknown) => {
  const error = err as {
    message?: string;
    response?: {
      status?: number;
      data?: {
        message?: string;
        error?: string;
      };
    };
  };

  if (error.response?.status === 401) return "Please log in to add items to your bag";
  return error.response?.data?.message || error.response?.data?.error || error.message || "Could not add item to bag";
};

export default function CategoryPage({ mode = "category" }: CategoryPageProps) {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [localQuery, setLocalQuery] = useState("");
  const qc = useQueryClient();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const query = mode === "all" ? searchParams.get("q") ?? "" : localQuery;

  const navigate = useNavigate();

  const addToBagMutation = useMutation({
    mutationFn: (productId: string) => addProductToCart(productId, 1),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const { data: apiCategories } = useQuery({
    queryKey: ["shop", "medicineCategories"],
    queryFn: getMedicinesByCategory,
    retry: 1,
  });

  const catalog = useMemo(() => {
    const entries = apiCategories?.length
      ? apiCategories.map((category) => ({
          slug: slugify(category.label),
          label: category.label,
          description: "",
          Icon: Icons.Pill,
          products: category.products,
        }))
      : defaultMedicineCatalog;

    return {
      entries,
      bySlug: new Map(entries.map((e) => [e.slug, e])),
    };
  }, [apiCategories]);

  const allProducts = useMemo(() => {
    return catalog.entries.flatMap((c) =>
      c.products.map((p) => ({
        ...p,
        categoryLabel: c.label,
        categorySlug: c.slug,
      })),
    );
  }, [catalog.entries]);

  const category = useMemo(() => {
    if (mode === "all") return null;
    if (!slug) return catalog.entries[0];
    return catalog.bySlug.get(slug) ?? catalog.entries[0];
  }, [mode, slug]);

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base =
      mode === "all"
        ? allProducts
        : (category?.products ?? []).map((p) => ({
            ...p,
            categoryLabel: category?.label ?? "",
            categorySlug: category?.slug ?? "",
          }));
    if (!q) return base;
    return base.filter((p) => p.name.toLowerCase().includes(q));
  }, [allProducts, category, mode, query]);

  const handleAddToBag = async (product: MedicineProduct) => {
    setAddingProductId(product.id);
    const toastId = toast.loading("Adding to bag...");

    if (!isMongoId(product.id)) {
      toast.success(`${product.name} is ready in your order request`, { id: toastId });
      setAddingProductId(null);
      navigate("/request-order", {
        state: {
          prefilledItem: {
            name: product.name,
            quantity: "1",
            notes: "",
            imageUrl: product.imageUrl,
            price: product.price,
          },
        },
      });
      return;
    }

    try {
      await addToBagMutation.mutateAsync(product.id);
      toast.success(`${product.name} added to bag`, { id: toastId });
      navigate("/cart");
    } catch (err) {
      toast.error(getErrorMessage(err), { id: toastId });
    } finally {
      setAddingProductId(null);
    }
  };

  const header = useMemo(() => {
    if (mode === "all") {
      return {
        title: "Shop Medicines",
        description:
          "Explore genuine medicines and healthcare essentials — verified and delivered by Medigo e‑Pharmacy.",
        Icon: Icons.Pill,
      };
    }
    return {
      title: category?.label ?? "Category",
      description: category?.description ?? "",
      Icon: category?.Icon ?? Icons.Pill,
    };
  }, [category, mode]);

  const CategoryIcon = header.Icon;

  return (
    <SectionContainer>
      <MainContainer>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <SectionHeading
              title={header.title}
              description={header.description}
              align="left"
            />
            <SectionParagraph className="mt-3">
              {mode === "all"
                ? "Search across the full catalog or jump to a category to shop faster."
                : "Browse items in this category and place an order request anytime."}
            </SectionParagraph>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Icons.Search className="!w-4 !h-4" />
              </span>
              <input
                value={query}
                onChange={(e) => {
                  const next = e.target.value;
                  if (mode === "all") {
                    const q = next.trim();
                    if (q) setSearchParams({ q }, { replace: true });
                    else setSearchParams({}, { replace: true });
                  } else {
                    setLocalQuery(next);
                  }
                }}
                className="w-full rounded-full border border-gray-200 bg-gray-50 px-10 py-2.5 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder={
                  mode === "all"
                    ? "Search products..."
                    : "Search in this category..."
                }
              />
            </div>

            <NavLink to="/request-order" className="w-full sm:w-auto">
              <CustomButton
                variant="primary"
                size="md"
                radius="full"
                fullWidth
                leftIcon={<Icons.Cart className="!w-4 !h-4" />}
              >
                Request Order
              </CustomButton>
            </NavLink>
          </div>
        </div>

        <div className="mt-7 rounded-2xl bg-gradient-to-r from-primary/25 via-secondary/20 to-primary/25 p-[1px] shadow-lg shadow-primary/5">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 center-flex">
                  <CategoryIcon className="!w-5 !h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-black text-dark">
                    {mode === "all" ? "Shop all products" : "Shop by category"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {products.length} items found
                  </p>
                </div>
              </div>
              <NavLink to="/prescription/history" className="hidden sm:block">
                <CustomButton
                  variant="outline"
                  size="sm"
                  radius="full"
                  leftIcon={<Icons.Prescription className="!w-4 !h-4" />}
                >
                  Upload Prescription
                </CustomButton>
              </NavLink>
            </div>

            {mode === "all" && (
              <div className="mt-5 flex flex-wrap gap-2">
                {catalog.entries.map((c) => (
                  <NavLink
                    key={c.slug}
                    to={`/category/${c.slug}`}
                    className="inline-flex"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-dark hover:bg-white hover:border-primary/25 transition">
                      <c.Icon className="!w-4 !h-4 text-primary" />
                      {c.label}
                    </span>
                  </NavLink>
                ))}
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-2xl border border-gray-100 bg-light overflow-hidden hover:bg-white hover:shadow-md transition"
                >
                  <div className="relative aspect-[4/3] bg-white center-flex">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="max-h-[90px] max-w-[85%] object-contain group-hover:scale-[1.03] transition-transform duration-300"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xxs font-black px-3 py-1 border border-primary/15">
                      <Icons.Check className="!w-4 !h-4" />
                      Verified
                    </span>
                  </div>

                  <div className="p-4">
                    <p className="text-sm font-black text-dark leading-snug line-clamp-2 min-h-[40px]">
                      {product.name}
                    </p>
                    {mode === "all" && (
                      <NavLink
                        to={`/category/${product.categorySlug}`}
                        className="mt-1 inline-flex text-xxs font-bold tracking-[0.18em] uppercase text-slate-500 hover:text-primary transition-colors"
                      >
                        {product.categoryLabel}
                      </NavLink>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-black text-primary">
                        {priceTag(product.price)}
                      </span>
                      <span className="text-xxs font-black tracking-[0.18em] uppercase text-slate-500">
                        Medigo
                      </span>
                    </div>
                    <div className="mt-3">
                      <CustomButton
                        variant="outline"
                        size="sm"
                        radius="full"
                        fullWidth
                        leftIcon={<Icons.Cart className="!w-4 !h-4" />}
                        onClick={() => handleAddToBag(product)}
                        loading={addingProductId === product.id}
                        disabled={addingProductId === product.id}
                        className="min-h-10 whitespace-nowrap text-xs sm:text-sm"
                      >
                        {addingProductId === product.id ? "Adding..." : "Add to Bag"}
                      </CustomButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="mt-8 rounded-xl border border-gray-100 bg-white p-5">
                <div className="flex items-start gap-3">
                  <Icons.AlertCircle className="!w-5 !h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-dark">No results</p>
                    <p className="text-sm text-slate-600 mt-2">
                      Try a different keyword, or request an order and we’ll
                      help you find the right item.
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                      <NavLink to="/request-order" className="sm:flex-1">
                        <CustomButton
                          variant="primary"
                          size="sm"
                          radius="full"
                          fullWidth
                          rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                        >
                          Request Order
                        </CustomButton>
                      </NavLink>
                      <NavLink to="/prescription/history" className="sm:flex-1">
                        <CustomButton
                          variant="outline"
                          size="sm"
                          radius="full"
                          fullWidth
                          leftIcon={<Icons.Prescription className="!w-4 !h-4" />}
                        >
                          Upload Prescription
                        </CustomButton>
                      </NavLink>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  );
}
