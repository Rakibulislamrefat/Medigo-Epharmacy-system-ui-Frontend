import Api from "../../../utilities/api";
import type { RegisterFormData, RegisterPayload } from "./register.type";

export const registerApi = async (form: RegisterFormData) => {
  const { avatar: _avatar, ...rest } = form;
  const phone = rest.phone.trim().replace(/[\s-]/g, "");
  const role = rest.role;

  const address = {
    label: "Home",
    name: rest.name.trim(),
    phone,
    line1: rest.location.displayName || rest.location.road || "Not provided",
    line2: "",
    city: rest.location.city || "",
    state: rest.location.state || rest.location.state_district || "",
    postcode: rest.location.postcode || "",
    country: rest.location.country || "",
    country_code: (rest.location.country_code || "").toUpperCase(),
    coordinates: {
      lat: rest.location.coordinates.lat,
      lng: rest.location.coordinates.lng,
    },
    isDefault: true,
  };

  const payload: RegisterPayload = {
    name: rest.name.trim(),
    email: rest.email.trim(),
    phone,
    password: rest.password,
    role,
    addresses: [address],
  };

  const { data } = await Api.post("/auth/register", payload);
  return data;
};
