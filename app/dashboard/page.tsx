import {
  getAllAdmins,
  getSetting,
} from "@/lib/actions";
import DashboardClient from "./components/DashboardClient";
import { IAdmin } from "@/lib/database/models/admin.model";
import { resolveDashboardDateFilter } from "@/lib/dashboard-date-filter";
import { getEcommerceDashboardStats } from "@/lib/ecommerce-dashboard.stats";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  try {
    const parsedSearchParams = (await searchParams) ?? {};
    const presetValue = parsedSearchParams.preset;
    const startDateValue = parsedSearchParams.startDate;
    const endDateValue = parsedSearchParams.endDate;

    const dateFilter = resolveDashboardDateFilter({
      preset: Array.isArray(presetValue) ? presetValue[0] : presetValue,
      startDate: Array.isArray(startDateValue)
        ? startDateValue[0]
        : startDateValue,
      endDate: Array.isArray(endDateValue) ? endDateValue[0] : endDateValue,
    });

    const [setting, admins, ecommerceStats] =
      await Promise.all([
        getSetting(),
        getAllAdmins(),
        getEcommerceDashboardStats(dateFilter),
      ]);

    return (
      <DashboardClient
        setting={setting ?? null}
        admins={(admins ?? []) as IAdmin[]}
        ecommerceStats={ecommerceStats}
        dateFilter={dateFilter}
      />
    );
  } catch (error) {
    console.error("Dashboard page error:", error);
    return (
      <div className="p-6 text-red-500">
        Failed to load dashboard. Try again later.
      </div>
    );
  }
}

