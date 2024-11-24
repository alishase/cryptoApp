"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Wallet2,
  LineChart,
  User,
  HelpCircle,
  Menu,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/market", icon: LineChart, label: "Market" },
    { href: "/wallet", icon: Wallet2, label: "Wallet" },
    { href: "/support", icon: HelpCircle, label: "Support" },
  ];

  const NavLinks = ({ mobile = false }) => (
    <NavigationMenuList
      className={
        mobile ? "flex-col items-between space-y-2 w-full" : "flex-row"
      }
    >
      {navItems.map((item) => (
        <NavigationMenuItem key={item.href} className={mobile ? "w-full" : ""}>
          <Link href={item.href} legacyBehavior passHref>
            <NavigationMenuLink
              className={
                mobile
                  ? "flex items-center p-3 hover:bg-accent rounded-md w-full text-lg"
                  : navigationMenuTriggerStyle()
              }
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      ))}
      {mobile && (
        <>
          {session ? (
            <NavigationMenuItem className="w-full mt-4">
              <Link href="/dashboard" legacyBehavior passHref>
                <NavigationMenuLink
                  className="flex items-center justify-center p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md w-full text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="mr-3 h-5 w-5" />
                  Profile
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ) : (
            <>
              <NavigationMenuItem className="w-full mt-4">
                <Link href="/login" legacyBehavior passHref>
                  <NavigationMenuLink
                    className="flex items-center justify-center p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md w-full text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn className="mr-3 h-5 w-5" />
                    Login
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem className="w-full mt-2">
                <Link href="/register" legacyBehavior passHref>
                  <NavigationMenuLink
                    className="flex items-center justify-center p-3 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md w-full text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserPlus className="mr-3 h-5 w-5" />
                    Register
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </>
          )}
        </>
      )}
    </NavigationMenuList>
  );

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between mx-8">
          <Link href="/" className="text-2xl font-bold">
            CryptoEx
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex flex-grow justify-center">
            <NavLinks />
          </NavigationMenu>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="text-left">Menu</SheetTitle>
              <nav className="mt-6">
                <NavigationMenu orientation="vertical" className="w-full">
                  <NavLinks mobile />
                </NavigationMenu>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Auth Buttons */}
          {session ? (
            <div className="hidden md:block">
              <Link href="/dashboard">
                <Button size="lg" className="text-lg">
                  <User className="mr-2 h-5 w-5" />
                  Profile
                </Button>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-base px-5">
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" className="text-base px-4">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Register
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
