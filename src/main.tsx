import ReactDOM from "react-dom/client";
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/effect-fade"
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import App from "./shared/app/App";

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <App />
    </Provider>
  </QueryClientProvider>
);