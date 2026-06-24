"use client";

import Hero from "./Hero";
import Feedback from "./Feedback";
import FAQ from "./FAQ";
import Popup from "./Popup";
import { ISetting } from "@/lib/database/models/setting.model";

export default function Home({
  setting,
  // courses,
}: {
  setting: ISetting | null;
  // courses?: ICourseSafe[];
}) {
  return (
    <main>
      <Popup setting={setting} />
      <Hero setting={setting} />
      <Feedback setting={setting} />
      <FAQ setting={setting} />
    </main>
  );
}
