"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { app } from "../../firebaseConfig";
import { getAuth, User, signOut } from "firebase/auth";
import AuthenticationForm from "./AuthenticationForm";
import {
  Navbar,
  NavbarItem,
  Input,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Image,
  NavbarContent,
  Tooltip,
} from "@nextui-org/react";
import { SearchIcon } from "./SearchIcon";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CategoryIcon from "@mui/icons-material/Category";
import ArticleIcon from "@mui/icons-material/Article";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import LogoutIcon from "@mui/icons-material/Logout";
import LogoHydroHealth from "../assets/images/logo/LogoHydroHealth.png";
import GuestIcon from "../assets/images/user/Guest.png";
import Link from "next/link";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useUserAuthentication } from "../services/usersServices";
import { Icon } from "@mui/material";

export default function Header() {
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const [activeMenu, setActiveMenu] = useState<string>("");
  const router = useRouter();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMonitoringOpen, setIsMonitoringOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((userData) => {
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error: any) {
      console.error("Error signing out:", error.message);
    }
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
  };

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navbarStyles = {
    backgroundColor: `rgba(237, 255, 228, ${scrollPosition > 0 ? 0.8 : 1})`,
  };

  return (
    <Navbar isBordered className="bg-#c2efa8" style={navbarStyles}>
      <NavbarContent>
        <Link href="/#">
          <Image
            width={200}
            alt="Logo Hydroheatlh"
            src={LogoHydroHealth.src}
          />
        </Link>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-10 font-medium">
        {user ? (
          <>
            <NavbarItem>
              <Link
                color="foreground"
                href="/about"
                className={`hover:text-emerald-500 transition-all ease-in-out duration-250 ${
                  activeMenu === "/about"
                    ? "text-emerald-400 font-semibold"
                    : ""
                }`}
                onClick={() => handleMenuClick("/#beranda")}
              >
                About Us
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                color="foreground"
                href="/#contact"
                className={`hover:text-emerald-500 transition-all ease-in-out duration-250 ${
                  activeMenu === "/about"
                    ? "text-emerald-400 font-semibold"
                    : ""
                }`}
                onClick={() => handleMenuClick("/#contact")}
              >
                Contact
              </Link>
            </NavbarItem>
          <NavbarItem>
            <Link
              color="foreground"
              href="/#feature"
              className={`hover:text-emerald-500 transition-all ease-in-out duration-250 ${
                activeMenu === "/#feature"
                  ? "text-emerald-400 font-semibold"
                  : ""
              }`}
              onClick={() => handleMenuClick("/#feature")}
            >
              Features
            </Link>
          </NavbarItem>
          <Dropdown
            onOpenChange={(open) => setIsMonitoringOpen(open)}
          >
            <NavbarItem>
              <DropdownTrigger>
                <button
                  className={`p-0 bg-transparent data-[hover=true]:bg-transparent font-medium hover:text-emerald-500 transition-all ease-in-out duration-250 ${
                    // Ini akan membuat menu tetap aktif jika Anda berada di salah satu halaman monitoring
                    activeMenu.startsWith("/monitoring")
                      ? "text-emerald-400 font-semibold"
                      : ""
                  }`}
                >
                  Monitoring 
                  <KeyboardArrowDownIcon 
                    className={`transition-transform ${
                      isMonitoringOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </DropdownTrigger>
            </NavbarItem>
            <DropdownMenu
              aria-label="Monitoring Actions"
            >
              <DropdownItem key="monitoring_1">
                <Link href="/monitoring" color="foreground" className="w-full flex">
                  Monitoring
                </Link>
              </DropdownItem>
              <DropdownItem key="monitoring_2">
                <Link href="/monitoring2" color="foreground" className="w-full flex">
                  Monitoring2
                </Link>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          </>
        ) : (
          <>
            <NavbarItem>
              <Link
                color="foreground"
                href="/about"
                className={`hover:text-emerald-500 transition-all ease-in-out duration-250 ${
                  activeMenu === "/about"
                    ? "text-emerald-400 font-semibold"
                    : ""
                }`}
                onClick={() => handleMenuClick("/about")}
              >
                About Us
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                color="foreground"
                href="/#contact"
                className={`hover:text-emerald-500 transition-all ease-in-out duration-250 ${
                  activeMenu === "/#contact" 
                    ? "text-emerald-400 font-semibold"
                    : ""
                }`}
                onClick={() => handleMenuClick("/#contact")}
              >
                Contact
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                color="foreground"
                href="/#feature"
                className={`hover:text-emerald-500 transition-all ease-in-out duration-250 ${
                  activeMenu === "/#feature"
                    ? "text-emerald-400 font-semibold"
                    : ""
                }`}
                onClick={() => handleMenuClick("/#feature")}
              >
                Features
              </Link>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <div className="items-center flex gap-4">
        {user ? (
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="success"
                size="sm"
                src={user?.photoURL || GuestIcon.src}
              />
            </DropdownTrigger>
            <div className="font-semibold flex flex-row items-center justify-center">
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem
                  key="profile"
                  color="secondary"
                  textValue="profile"
                  className="h-14 gap-2 text-blue-800 bg-blue-100"
                >
                  <div>
                    <div className="font-semibold">
                      {user ? user.displayName : ""}
                    </div>
                    <div className="font-medium text-xs text-emerald-500">
                      {user ? user.email : ""}
                    </div>
                  </div>
                </DropdownItem>
                <DropdownItem color="default" key="beranda" textValue="beranda">
                  <Link
                    className="flex flex-row items-center"
                    href="/#"
                    color="foreground"
                  >
                    <HomeIcon color="action" />
                    Home
                  </Link>
                </DropdownItem>
                <DropdownItem color="default" key="admin" textValue="admin">
                    <Link
                      className="flex flex-row items-center gap-1"
                      href="/admin"
                      color="foreground"
                      onClick={() => handleMenuClick("/admin")}
                    >
                      <AdminPanelSettingsIcon color="action" />
                      Admin Page
                    </Link>
                  </DropdownItem>
                <DropdownItem color="default" key="about" textValue="about" className="sm:hidden">
                  <Link
                    className="flex flex-row items-center gap-1"
                    href="/about"
                    color="foreground"
                  >
                    <ArticleIcon color="action" />
                    About Us
                  </Link>
                </DropdownItem>
                <DropdownItem color="default" key="bantuan" textValue="bantuan" className="sm:hidden">
                  <Link
                    className="flex flex-row items-center gap-1"
                    href="/#contact"
                    color="foreground"
                  >
                    <HelpIcon color="action" />
                    Contact
                  </Link>
                </DropdownItem>
                <DropdownItem
                  color="default"
                  key="feature"
                  textValue="feature"
                  className="sm:hidden"
                >
                  <Link
                    className="flex flex-row items-center gap-1"
                    href="/#feature"
                    color="foreground"
                  >
                    <CategoryIcon color="action" />
                    Feature
                  </Link>
                </DropdownItem>
                <DropdownItem
                  color="default"
                  key="monitoring"
                  textValue="Monitoring"
                  className="sm:hidden"
                >
                  <Link
                    className="flex flex-row items-center gap-1"
                    href="/monitoring"
                    color="foreground"
                  >
                    <DashboardIcon color="action" />
                    Monitoring
                  </Link>
                </DropdownItem>
                <DropdownItem
                  color="danger"
                  key="logout"
                  className="mt-1 bg-blue-100"
                  textValue="actionauth"
                >
                  <NavbarContent
                    className="font-semibold text-red-800 flex flex-row items-center justify-center"
                    onClick={handleLogout}
                  >
                    <button className="flex flex-row items-center">
                      <p>Keluar</p>
                      <LogoutIcon />
                    </button>
                  </NavbarContent>
                </DropdownItem>
              </DropdownMenu>
            </div>
          </Dropdown>
        ) : (
          <>
            <AuthenticationForm />
            <Dropdown placement="bottom-start">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="success"
                  size="sm"
                  src={GuestIcon.src}
                />
              </DropdownTrigger>
              <div className="font-semibold flex flex-row items-center justify-center">
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem
                    color="default"
                    key="home"
                    textValue="home"
                  >
                    <Link
                      className="flex flex-row items-center"
                      href="/#"
                      color="foreground"
                    >
                      <HomeIcon color="action" />
                      Home
                    </Link>
                  </DropdownItem>
                  <DropdownItem color="default" key="about" textValue="about" className="sm:hidden">
                  <Link
                    className="flex flex-row items-center gap-1"
                    href="/about"
                    color="foreground"
                  >
                    <ArticleIcon color="action" />
                    About Us
                  </Link>
                </DropdownItem>
                <DropdownItem color="default" key="about" textValue="about" className="sm:hidden">
                    <Link
                      className="flex flex-row items-center gap-1"
                      href="/#contact"
                      color="foreground"
                    >
                      <ArticleIcon color="action" />
                      Contact
                    </Link>
                  </DropdownItem>
                  <DropdownItem
                    color="default"
                    key="feature"
                    textValue="feature"
                    className="sm:hidden"
                  >
                    <Link
                      className="flex flex-row items-center gap-1"
                      href="/#feature"
                      color="foreground"
                    >
                      <CategoryIcon color="action" />
                      Feature
                    </Link>
                  </DropdownItem>
                  
                </DropdownMenu>
              </div>
            </Dropdown>
          </>
        )}
      </div>
    </Navbar>
  );
}
