import { Icons } from "@/components/icons";

export function Footer() {
  return (
    <footer className="w-full border-t">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Icons.logo className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Clash VLess VPN 官网. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
