import { demos } from "@/lib/demos";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-0" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>data</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}

          {/* Embedded Example Section */}
          <div className="container mx-auto max-w-6xl px-6 py-12 space-y-16">
            <h1 className="text-4xl font-extrabold text-center text-gray-900">
              Explore Our Examples
            </h1>

            <div className="space-y-12">
              {demos.map((section) => (
                <div key={section.name} className="space-y-6">
                  {/* Section Header */}
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant="outline"
                      className="bg-gradient-to-r from-teal-400 to-blue-500 text-white px-4 py-2 rounded-md shadow-sm uppercase tracking-wide text-sm font-medium"
                    >
                      {section.name}
                    </Badge>
                  </div>

                  {/* Card Container */}
                  <div className="flex flex-wrap gap-6">
                    {section.items.map((item) => (
                      <Link
                        href={`/${item.slug}`}
                        key={item.name}
                        className="flex-1 basis-[calc(33.333%-1rem)] max-w-[calc(33.333%-1rem)]"
                      >
                        <Card className="group bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-2">
                          <CardHeader className="p-4">
                            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-teal-600">
                              {item.name}
                            </h2>
                          </CardHeader>
                          {item.description && (
                            <CardContent className="p-4">
                              <p className="text-sm text-gray-600 group-hover:text-gray-800">
                                {item.description}
                              </p>
                            </CardContent>
                          )}
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
