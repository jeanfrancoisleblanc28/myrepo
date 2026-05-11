"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const SupplierMap = dynamic(() => import("./supplier-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-[520px] w-full rounded-lg" />,
});

export function SupplierMapLoader() {
  return <SupplierMap />;
}
