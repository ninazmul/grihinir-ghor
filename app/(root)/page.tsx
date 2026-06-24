import HomeClient from "@/components/shared/HomeClient";
import Loader from "@/components/shared/Loader";
import { getSetting } from "@/lib/actions/setting.actions";
import { Suspense } from "react";

export const revalidate = 60;

async function HomeContent() {
  const setting = await getSetting();

  return <HomeClient setting={setting} />;
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
