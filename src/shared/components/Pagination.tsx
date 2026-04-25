import { Icons } from "../icons/Icons";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  // Build page numbers with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-10">

      {/* Showing X - Y of Z */}
      <p className="text-sm text-gray-400">
        Showing{" "}
        <span className="text-secondary font-semibold">{startItem}–{endItem}</span>
        {" "}of{" "}
        <span className="text-secondary font-semibold">{totalItems}</span>
        {" "}results
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-2">

        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
            ${currentPage === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-secondary border border-gray-200 hover:bg-secondary hover:text-white hover:border-secondary"
            }`}
        >
          <Icons.ArrowBack size={14} />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`w-9 h-9 rounded-full text-sm font-semibold transition-all duration-200
                ${currentPage === page
                  ? "bg-secondary text-white shadow-md scale-105"
                  : "text-secondary border border-gray-200 hover:bg-secondary hover:text-white hover:border-secondary"
                }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
            ${currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "text-secondary border border-gray-200 hover:bg-secondary hover:text-white hover:border-secondary"
            }`}
        >
          <Icons.ArrowForward size={14} />
        </button>

      </div>
    </div>
  );
};

export default Pagination;