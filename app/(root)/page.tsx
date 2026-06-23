import HomeClient from "@/components/shared/HomeClient";
import Loader from "@/components/shared/Loader";
import { getCourses } from "@/lib/actions/course.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { Suspense } from "react";

export const revalidate = 60;

async function HomeContent() {
  const setting = await getSetting();
  const courses = await getCourses({ status: "active" });

  return <HomeClient setting={setting} courses={courses} />;
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <Loader
          label="Loading Home Page..."
        />
      }
    >
      <HomeContent />
    </Suspense>
  );
}
