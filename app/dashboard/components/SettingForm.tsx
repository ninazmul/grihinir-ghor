"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Path } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/shared/FileUploader";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { useUploadThing } from "@/lib/uploadthing";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Trash2, Plus } from "lucide-react";

/* ================= HELPERS ================= */

const optionalString = z.preprocess(
  (v) => (v === null || v === "" ? undefined : v),
  z.string().optional(),
);

const optionalEmail = z.preprocess(
  (v) => (v === null || v === "" ? undefined : v),
  z.string().email().optional(),
);

const optionalUrl = z.preprocess(
  (v) => (v === null || v === "" ? undefined : v),
  z.string().url().optional(),
);

/* ================= ZOD SCHEMA ================= */

export const settingSchema = z.object({
  branding: z
    .object({
      storeName: optionalString,
      logo: optionalString,
      favicon: optionalString,
      tagline: optionalString,
      description: optionalString,
    })
    .default({}),

  contact: z
    .object({
      email: optionalEmail,
      phoneNumber: optionalString,
      whatsapp: optionalString,
      address: optionalString,
    })
    .default({}),

  socials: z
    .object({
      facebook: optionalUrl,
      instagram: optionalUrl,
      twitter: optionalUrl,
      youtube: optionalUrl,
      facebookGroup: optionalUrl,
      linkedin: optionalUrl,
      tiktok: optionalUrl,
    })
    .default({}),

  seo: z
    .object({
      metaTitle: optionalString,
      metaDescription: optionalString,
      metaKeywords: z.array(z.string()).default([]),
      ogImage: optionalString,
    })
    .default({ metaKeywords: [] }),

  hero: z
    .object({
      // useFieldArray works best with objects, not primitive string arrays
      images: z.array(z.object({ url: z.string() })).default([]),
    })
    .default({ images: [] }),

  policies: z
    .object({
      returnPolicy: optionalString,
      privacyPolicy: optionalString,
      termsOfService: optionalString,
    })
    .default({}),

  faqs: z
    .object({
      badge: optionalString,
      title: optionalString,
      description: optionalString,
      items: z
        .array(
          z.object({
            question: optionalString,
            answer: optionalString,
          }),
        )
        .default([]),
    })
    .default({ items: [] }),

  analytics: z
    .object({
      facebookPixelId: optionalString,
    })
    .default({}),
});

export type SettingFormValues = z.infer<typeof settingSchema>;

/* ================= COMPONENT ================= */

export default function SettingForm({
  initialData,
  onSubmit,
}: {
  initialData?: Partial<SettingFormValues>;
  onSubmit: (data: SettingFormValues) => Promise<void>;
}) {
  const router = useRouter();
  const { startUpload } = useUploadThing("mediaUploader");

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema) as any,
    defaultValues: {
      branding: {},
      contact: {},
      socials: {},
      seo: { metaKeywords: [] },
      hero: { images: [] },
      policies: {},
      faqs: { items: [] },
      analytics: {},
      ...initialData,
    },
  });

  const { isDirty, isSubmitting } = form.formState;

  /* ================= FIELD ARRAYS ================= */

  const {
    fields: heroFields,
    append: appendHero,
    remove: removeHero,
  } = useFieldArray({
    control: form.control,
    name: "hero.images",
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control: form.control,
    name: "faqs.items",
  });

  /* ================= HELPERS ================= */

  const renderInput = (
    name: Path<SettingFormValues>,
    label: string,
    type: string = "text",
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              value={(field.value as string) ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderUrl = (name: Path<SettingFormValues>, label: string) =>
    renderInput(name, label, "url");

  /* ================= UI ================= */

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          try {
            await onSubmit(data);
            toast.success("Settings saved successfully!");
            router.refresh();
          } catch (err) {
            toast.error("Failed to save settings");
          }
        })}
        className="max-w-5xl mx-auto p-6 space-y-6 bg-white rounded-lg border shadow-sm"
      >
        <Accordion
          type="single"
          collapsible
          defaultValue="branding"
          className="w-full"
        >
          {/* ================= BRANDING ================= */}
          <AccordionItem value="branding">
            <AccordionTrigger>Branding & Contact</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="branding.logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo</FormLabel>
                      <FormControl>
                        <FileUploader
                          imageUrl={field.value || ""}
                          onFieldChange={async (_, files) => {
                            if (!files?.length) return;
                            const uploaded = await startUpload(files);
                            if (uploaded?.[0]) {
                              form.setValue("branding.logo", uploaded[0].url, {
                                shouldDirty: true,
                              });
                            }
                          }}
                          setFiles={() => {}}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branding.favicon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favicon</FormLabel>
                      <FormControl>
                        <FileUploader
                          imageUrl={field.value || ""}
                          onFieldChange={async (_, files) => {
                            if (!files?.length) return;
                            const uploaded = await startUpload(files);
                            if (uploaded?.[0]) {
                              form.setValue(
                                "branding.favicon",
                                uploaded[0].url,
                                { shouldDirty: true },
                              );
                            }
                          }}
                          setFiles={() => {}}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {renderInput("branding.storeName", "Store Name")}
              {renderInput("branding.tagline", "Tagline")}

              <FormField
                control={form.control}
                name="branding.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                {renderInput("contact.email", "Email", "email")}
                {renderInput("contact.phoneNumber", "Phone")}
              </div>
              {renderInput("contact.address", "Address")}
            </AccordionContent>
          </AccordionItem>

          {/* ================= SOCIALS ================= */}
          <AccordionItem value="socials">
            <AccordionTrigger>Social Media</AccordionTrigger>
            <AccordionContent className="grid md:grid-cols-2 gap-4 pt-2">
              {renderUrl("socials.facebook", "Facebook")}
              {renderUrl("socials.instagram", "Instagram")}
              {renderUrl("socials.twitter", "Twitter")}
              {renderUrl("socials.youtube", "YouTube")}
              {renderUrl("socials.facebookGroup", "Facebook Group")}
              {renderUrl("socials.linkedin", "LinkedIn")}
              {renderUrl("socials.tiktok", "TikTok")}
            </AccordionContent>
          </AccordionItem>

          {/* ================= SEO ================= */}
          <AccordionItem value="seo">
            <AccordionTrigger>SEO</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {renderInput("seo.metaTitle", "Meta Title")}
              {renderInput("seo.metaDescription", "Meta Description")}
              {renderInput("seo.ogImage", "OG Image URL")}

              <FormField
                control={form.control}
                name="seo.metaKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords (comma separated)</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value?.join(", ") || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split(",").map((v) => v.trim()),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* ================= HERO ================= */}
          <AccordionItem value="hero">
            <AccordionTrigger>Hero Section</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {heroFields.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative border p-3 rounded-lg bg-gray-50 flex flex-col gap-2"
                  >
                    <FormField
                      control={form.control}
                      name={`hero.images.${index}.url`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <FileUploader
                              imageUrl={field.value || ""}
                              onFieldChange={async (_, files) => {
                                if (!files?.length) return;
                                const uploaded = await startUpload(files);
                                if (uploaded?.[0]) {
                                  form.setValue(
                                    `hero.images.${index}.url`,
                                    uploaded[0].url,
                                    { shouldDirty: true },
                                  );
                                }
                              }}
                              setFiles={() => {}}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="w-full mt-auto"
                      onClick={() => removeHero(index)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => appendHero({ url: "" })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Image
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* ================= POLICIES ================= */}
          <AccordionItem value="policies">
            <AccordionTrigger>Policies</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {renderInput("policies.returnPolicy", "Return Policy")}
              {renderInput("policies.privacyPolicy", "Privacy Policy")}
              {renderInput("policies.termsOfService", "Terms of Service")}
            </AccordionContent>
          </AccordionItem>

          {/* ================= FAQ ================= */}
          <AccordionItem value="faqs">
            <AccordionTrigger>FAQs</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {faqFields.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 border p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex-1 grid md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`faqs.items.${index}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Question"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`faqs.items.${index}.answer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Answer"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeFaq(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => appendFaq({ question: "", answer: "" })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add FAQ
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* ================= SAVE ================= */}
        <Button
          type="submit"
          disabled={!isDirty || isSubmitting}
          className="w-full py-6 text-base"
        >
          {isSubmitting ? "Saving Changes..." : "Save Settings"}
        </Button>
      </form>
    </Form>
  );
}
