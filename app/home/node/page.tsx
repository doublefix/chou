import { DataTable } from "@/components/dashboard/data-table-node";
import { SectionCards } from "@/components/dashboard/section-cards";

import data from "./data.json";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <DataTable data={data} />
        </div>
      </div>
     </div>
  );
}

// 采用状态提升,单向数据流
// 使用useState + useEffect实现单向数据流
// 数据请求放在父页面是“常规做法”