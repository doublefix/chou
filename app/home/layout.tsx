import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NavActions } from "@/components/nav-actions"
import { Input } from "@/components/ui/input2";
import { Search } from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background">
          <div className="flex items-center gap-4 px-4 relative">
            <Search className="absolute left-7 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              autoComplete="off"
              spellCheck="false"
              placeholder="Search models, datasets, users..."
              className="h-9 w-[360px] pl-10"
            />
          </div>
          <div className="ml-auto px-3 gap-4 px-4 ">
            <NavActions />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
