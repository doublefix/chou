"use client";

import type { Item } from "@/components/ui/test/tab-group";
import clsx from "clsx";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export const Tab = ({
  path,
  parallelRoutesKey,
  item,
}: {
  path: string;
  parallelRoutesKey?: string;
  item: Item;
}) => {
  const segment = useSelectedLayoutSegment(parallelRoutesKey);

  const href = item.slug ? path + "/" + item.slug : path;
  const isActive =
    // Example home pages e.g. `/layouts`
    (!item.slug && segment === null) ||
    segment === item.segment ||
    // Nested pages e.g. `/layouts/electronics`
    segment === item.slug;

  return (
    <Link
      href={href}
      className={clsx(
        "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        {
          // Active state
          "bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md hover:from-blue-600 hover:to-teal-600":
            isActive,
          // Inactive state
          "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900":
            !isActive,
        }
      )}
    >
      {item.text}
    </Link>
  );
};