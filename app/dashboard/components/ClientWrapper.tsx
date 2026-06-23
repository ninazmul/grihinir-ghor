"use client";

import { useRouter } from "next/navigation";
import { upsertSetting } from "@/lib/actions/setting.actions";
import SettingForm, { SettingFormValues } from "../components/SettingForm";

export default function ClientWrapper({
  initialData,
}: {
  initialData: Partial<SettingFormValues>;
}) {
  const router = useRouter();

  async function onSubmit(data: SettingFormValues) {
    // Transform the structure to match what the server action expects
    const payload = {
      ...data,
      hero: {
        ...data.hero,
        // Convert [{ url: "..." }] back to ["..."]
        images: data.hero?.images?.map((img) => img.url) || [],
      },
      faqs: data.faqs
        ? {
            ...data.faqs,
            items:
              data.faqs.items?.map((item) => ({
                question: item.question ?? "",
                answer: item.answer ?? "",
              })) || [],
          }
        : undefined,
    };

    await upsertSetting(payload);
    router.refresh();
  }

  return <SettingForm initialData={initialData} onSubmit={onSubmit} />;
}
