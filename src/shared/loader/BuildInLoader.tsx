import { LifeLine } from "react-loading-indicators";

const BuildInLoader = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-light px-4">
      <div className="rounded-2xl border border-gray-100 bg-white px-8 py-7 shadow-sm">
        <LifeLine color="#0b6b5a" size="large" text="Loading..." textColor="#0b6b5a" />
      </div>
    </div>
  );
};

export default BuildInLoader;
