import MainContainer from "../../../shared/main-container/MainContainer";

export default function RequestedOrdersPage() {
  return (
    <MainContainer>
      <h2 className="text-2xl font-bold">Requested Orders</h2>
      <p className="mt-3 text-sm text-slate-600">List of incoming requested orders to process.</p>
    </MainContainer>
  );
}
