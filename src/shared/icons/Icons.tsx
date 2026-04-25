import {
  FaHome,
  FaUser,
  FaUsers,
  FaSearch,
  FaPhoneAlt,
  FaHospital,
  FaHeartbeat,
  FaTint,
  FaAmbulance,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaFacebook,
  FaStar,
  FaLock,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import { LiaFilePrescriptionSolid } from "react-icons/lia";
import { MdDashboard, MdEmail, MdBloodtype } from "react-icons/md";
import { GrLocationPin } from "react-icons/gr";
import { AiOutlineLoading, AiOutlineMenu, AiOutlineSetting } from "react-icons/ai";
import { BsCheckCircleFill, BsClockHistory, BsInstagram, BsMailbox, BsShield, BsTrash } from "react-icons/bs";
import { CiDeliveryTruck, CiLogin, CiPill, CiShoppingCart, CiTwitter } from "react-icons/ci";
import { CgClose, CgCopyright } from "react-icons/cg";
import { IoIosArrowBack, IoIosArrowForward, IoMdArrowForward } from "react-icons/io";
import { LuHandshake } from "react-icons/lu";
import { CiClock2 } from "react-icons/ci";
import { FiPlus } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { IoAlertCircleOutline } from "react-icons/io5";





const responsiveIcon ="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7";

const createIcon = (IconComponent: IconType) => {
  return ({ className = "", ...props }: { className?: string } & Record<string, unknown>) => (
    <IconComponent className={`${responsiveIcon} ${className}`} {...props} />
  );
};

export const Icons = {
  Home: createIcon(FaHome),
  Dashboard: createIcon(MdDashboard),
  Menu: createIcon(AiOutlineMenu),
  Close: createIcon(CgClose),
  ArrowForward: createIcon(IoMdArrowForward),

  User: createIcon(FaUser),
  Users: createIcon(FaUsers),

  Search: createIcon(FaSearch),
  Phone: createIcon(FaPhoneAlt),
  Email: createIcon(MdEmail),

  Blood: createIcon(FaTint),
  BloodType: createIcon(MdBloodtype),
  Heartbeat: createIcon(FaHeartbeat),

  Emergency: createIcon(FaAmbulance),

  Hospital: createIcon(FaHospital),

  Location: createIcon(FaMapMarkerAlt),
  LocationPin: createIcon(GrLocationPin),

  Check: createIcon(BsCheckCircleFill),
  Clock: createIcon(BsClockHistory),
  Trash: createIcon(BsTrash),

  Setting: createIcon(AiOutlineSetting),
  Logout: createIcon(FaSignOutAlt),

  Facebook: createIcon(FaFacebook),
  Twitter: createIcon(CiTwitter),
  Instagram: createIcon(BsInstagram),
  Mail: createIcon(BsMailbox),
  Copy: createIcon(CgCopyright),
  HandShake: createIcon(LuHandshake),
  Time: createIcon(CiClock2),
  Lock: createIcon(FaLock),
  Plus: createIcon(FiPlus),
  Cross: createIcon(RxCross2),
  Arrow: createIcon(IoIosArrowForward),
  ArrowBack: createIcon(IoIosArrowBack),
  AlertCircle: createIcon(IoAlertCircleOutline),
  Loading: createIcon(AiOutlineLoading),
  Shield: createIcon(BsShield),
  Login: createIcon(CiLogin),
  Cart: createIcon(CiShoppingCart),
  Delivery: createIcon(CiDeliveryTruck),
  Prescription: createIcon(LiaFilePrescriptionSolid),
  Pill: createIcon(CiPill),
  Star: createIcon(FaStar),
};
