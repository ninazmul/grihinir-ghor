import {
  getAllAdmins,
  getCourses,
  getRegistrations,
  getSetting,
} from "@/lib/actions";
import DashboardClient from "./components/DashboardClient";
import { IAdmin } from "@/lib/database/models/admin.model";
import { ICourseSafe } from "@/lib/database/models/course.model";
import { SerializedRegistration } from "@/lib/actions/registration.actions";
import { resolveDashboardDateFilter } from "@/lib/dashboard-date-filter";

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

    const [setting, admins, courses, registrations] =
      await Promise.all([
        getSetting(),
        getAllAdmins(),
        getCourses({ tab: "all" }),
        getRegistrations({ dateFilter }),
      ]);

    return (
      <DashboardClient
        setting={setting ?? null}
        admins={(admins ?? []) as IAdmin[]}
        courses={(courses ?? []) as ICourseSafe[]}
        registrations={(registrations ?? []) as SerializedRegistration[]}
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
