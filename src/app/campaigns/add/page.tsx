"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";

import {
  MdSave, MdCalendarToday, MdAccessTime, MdTitle,
  MdEmail, MdPublic, MdHome, MdAttachMoney, MdPeople,
  MdWork, MdFamilyRestroom, MdSchool, MdLocationOn, MdCategory,
  MdFilterList
} from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";

import { InputField } from "@/components/common/InputField";
import { TextInput } from "@/components/common/Textinput";
import { SelectInput } from "@/components/common/Selectinput";
import { TextArea } from "@/components/common/Textarea";
import { CheckboxButton } from "@/components/common/Checkboxbutton";
import { SectionCard } from "@/components/common/Sectioncard";
import { PageHeader } from "@/components/common/Pageheader";

import {
  campaignScheme,
  CampaignAddData,
  CampaignAddDataDefaultValues,
  campaignTypesOptions,
  channelsOptions,
  statusesOptions,
  geographicScopesOptions,
  propertyTypesOptions,
  distressIndicatorsOptions,
  qualificationStatusesOptions,
  ageRangesOptions,
  ethnicitiesOptions,
  salaryRangesOptions,
  maritalStatusesOptions,
  employmentStatusesOptions,
  homeOwnershipStatusesOptions
} from "./utility";

import { createCampaignService } from "@/services/campaigns.service";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export default function AddCampaignPage() {
  const { currentTheme } = useTheme();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<CampaignAddData>({
    resolver: yupResolver(campaignScheme) as any,
    mode: "all",
    defaultValues: CampaignAddDataDefaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (data: CampaignAddData) => {
      // Need to cast or transform data if necessary to match the service expectation
      // The service expects Partial<CampaignData>, which implies simpler types (no CheckboxGroup complexities etc)
      // But our CampaignAddData is already aligned with strict strings/numbers/arrays.
      // We might need to ensure numbers are numbers. Yup handles this transformation.
      return await createCampaignService(data as any);
    },
    onSuccess: (response: any) => {
      const isSuccess = response?.is_success === true || (response?.data && !response?.error);
      if (isSuccess) {
        showSuccessToast("Campaign Created Successfully!");
        setTimeout(() => {
          router.push("/campaigns");
        }, 1500);
      } else {
        showErrorToast(response?.message || "Failed to create campaign");
      }
    },
    onError: (error: any) => {
      console.error("Campaign submission error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create campaign";
      showErrorToast(errorMessage);
    }
  });

  const onSubmit: SubmitHandler<CampaignAddData> = (data) => {
    mutation.mutate(data);
  };

  // Helper for array checkboxes (Channel, Distress)
  const handleArrayChange = (field: "channel" | "distress_indicators", value: string, checked: boolean) => {
    const current = getValues(field) || [];
    // Ensure current is an array (it might be null/undefined initially despite defaultValues if not strictly typed)
    const currentArray = Array.isArray(current) ? current : [];

    let newArray: string[];
    if (checked) {
      newArray = [...currentArray, value];
    } else {
      newArray = currentArray.filter((v: string) => v !== value);
    }
    setValue(field, newArray as any, { shouldValidate: true, shouldDirty: true });
  };

  // Helper for single checkbox (boolean)
  const handleBooleanChange = (field: keyof CampaignAddData, checked: boolean) => {
    setValue(field, checked as any, { shouldValidate: true, shouldDirty: true });
  };

  const labelStyle = "block text-xs font-extrabold uppercase tracking-wide mb-1.5 opacity-90";

  // Watch values for controlled components logic if needed
  const currentChannels = watch("channel");
  const currentDistress = watch("distress_indicators");
  const useAi = watch("use_ai_personalization");

  return (
    <div className="max-w-[1600px] mx-auto pb-20 fade-in-up">

      {/* Header */}
      <PageHeader
        backLink="/campaigns"
        title="Create Marketing Campaign"
        subtitle="Design and launch targeted campaigns"
        actions={
          <>
            <button
              type="button"
              onClick={() => router.push('/campaigns')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-black/5 whitespace-nowrap"
              style={{ borderColor: currentTheme.borderColor, color: currentTheme.textColor }}
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-lg text-white text-sm font-bold shadow-md hover:brightness-110 flex items-center justify-center gap-2 whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: currentTheme.primary }}
              disabled={mutation.isPending}
            >
              <MdSave size={18} />
              <span>{mutation.isPending ? "Saving..." : "Save Campaign"}</span>
            </button>
          </>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* --- 1. Basic Information --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SectionCard stepNumber={1} title="Basic Information" bgColor="bg-blue-50" textColor="text-blue-600">
            <div className="grid grid-cols-12 gap-x-4 gap-y-5">
              <div className="col-span-12">
                <InputField label="Campaign Name" required icon={<MdTitle />} error={errors.name?.message}>
                  <TextInput {...register("name")} placeholder="Summer Property Campaign" />
                </InputField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Campaign Type" required icon={<MdCategory />} error={errors.campaign_type?.message}>
                  <SelectInput {...register("campaign_type")} placeholder="Select Type" options={campaignTypesOptions} />
                </InputField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Status" required icon={<MdFilterList />} error={errors.status?.message}>
                  <SelectInput {...register("status")} options={statusesOptions} />
                </InputField>
              </div>
              <div className="col-span-12">
                <label className={labelStyle} style={{ color: currentTheme.headingColor }}>
                  Marketing Channels <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {channelsOptions.map((option) => {
                    const isChecked = currentChannels?.includes(option.value);
                    return (
                      <CheckboxButton
                        key={option.value}
                        label={option.label}
                        checked={!!isChecked}
                        onChange={(e) => handleArrayChange('channel', option.value, e.target.checked)}
                        className="capitalize"
                      />
                    );
                  })}
                </div>
                {errors.channel && <p className="text-red-500 text-xs mt-1 font-medium  p-1 rounded">{errors.channel.message}</p>}
              </div>
              <div className="col-span-12">
                <CheckboxButton
                  label="Use AI Personalization"
                  checked={!!useAi}
                  onChange={(e) => handleBooleanChange('use_ai_personalization', e.target.checked)}
                />
              </div>
            </div>
          </SectionCard>

          {/* --- 2. Schedule --- */}
          <SectionCard stepNumber={2} title="Campaign Schedule" bgColor="bg-orange-50" textColor="text-orange-600">
            <div className="grid grid-cols-12 gap-x-4 gap-y-5">
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Start Date" required icon={<MdCalendarToday />} error={errors.scheduled_start_date?.message}>
                  <TextInput type="date" {...register("scheduled_start_date")} />
                </InputField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="End Date" required icon={<MdCalendarToday />} error={errors.scheduled_end_date?.message}>
                  <TextInput type="date" {...register("scheduled_end_date")} />
                </InputField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Start Time" required icon={<MdAccessTime />} error={errors.scheduled_start_time?.message}>
                  <TextInput type="time" {...register("scheduled_start_time")} />
                </InputField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="End Time" required icon={<MdAccessTime />} error={errors.scheduled_end_time?.message}>
                  <TextInput type="time" {...register("scheduled_end_time")} />
                </InputField>
              </div>
            </div>
          </SectionCard>
        </div>
        {/* --- 3. Content --- */}
        <SectionCard stepNumber={3} title="Message Content" bgColor="bg-purple-50" textColor="text-purple-600">
          <div className="grid grid-cols-12 gap-x-4 gap-y-5">
            <div className="col-span-12">
              <InputField label="Email Subject Line" required icon={<MdTitle />} error={errors.subject_line?.message}>
                <TextInput {...register("subject_line")} placeholder="Exclusive Investment Opportunity" />
              </InputField>
            </div>
            <div className="col-span-12">
              <label className={labelStyle} style={{ color: currentTheme.headingColor }}>
                Email Content <span className="text-red-500 ml-1">*</span>
              </label>
              <TextArea {...register("email_content")} rows={6} placeholder="Dear investor, we have an exciting opportunity..." />
              {errors.email_content && <p className="text-red-500 text-xs mt-1 font-medium  p-1 rounded">{errors.email_content.message}</p>}
            </div>
          </div>
        </SectionCard>

        {/* --- 4. Targeting & 5. Demographics --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SectionCard stepNumber={4} title="Targeting Criteria" bgColor="bg-emerald-50" textColor="text-emerald-600">
            <div className="grid grid-cols-12 gap-x-4 gap-y-5">
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Geographic Scope" icon={<MdPublic />} error={errors.geographic_scope_type?.message}>
                  <SelectInput {...register("geographic_scope_type")} placeholder="Select Scope" options={geographicScopesOptions} />
                </InputField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Property Type" icon={<MdHome />} error={errors.property_type?.message}>
                  <SelectInput {...register("property_type")} placeholder="Select Type" options={propertyTypesOptions} />
                </InputField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Min Price" icon={<MdAttachMoney />} error={errors.min_price?.message} required>
                  <TextInput type="number" {...register("min_price")} placeholder="100000" />
                </InputField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Max Price" icon={<MdAttachMoney />} error={errors.max_price?.message} required>
                  <TextInput type="number" {...register("max_price")} placeholder="500000" />
                </InputField>
              </div>
              <div className="col-span-12">
                <label className={labelStyle} style={{ color: currentTheme.headingColor }}>Distress Indicators</label>
                <div className="grid grid-cols-2 gap-3">
                  {distressIndicatorsOptions.map((option) => {
                    const isChecked = currentDistress?.includes(option.value);
                    return (
                      <CheckboxButton
                        key={option.value}
                        label={option.label}
                        checked={!!isChecked}
                        onChange={(e) => handleArrayChange('distress_indicators', option.value, e.target.checked)}
                        className="capitalize"
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* --- 5. Demographics --- */}
          <SectionCard stepNumber={5} title="Demographics" bgColor="bg-pink-50" textColor="text-pink-600">
            <div className="grid grid-cols-12 gap-x-4 gap-y-5">
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Qualification" icon={<MdSchool />} error={errors.last_qualification?.message}>
                  <SelectInput {...register("last_qualification")} placeholder="Select Status" options={qualificationStatusesOptions} />
                </InputField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Age Range" icon={<MdPeople />} error={errors.age_range?.message}>
                  <SelectInput {...register("age_range")} placeholder="Select Range" options={ageRangesOptions} />
                </InputField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Ethnicity" icon={<MdPeople />} error={errors.ethnicity?.message}>
                  <SelectInput {...register("ethnicity")} placeholder="Select Ethnicity" options={ethnicitiesOptions} />
                </InputField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Salary Range" icon={<MdAttachMoney />} error={errors.salary_range?.message}>
                  <SelectInput {...register("salary_range")} placeholder="Select Range" options={salaryRangesOptions} />
                </InputField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Marital Status" icon={<MdFamilyRestroom />} error={errors.marital_status?.message}>
                  <SelectInput {...register("marital_status")} placeholder="Select Status" options={maritalStatusesOptions} />
                </InputField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Employment Status" icon={<MdWork />} error={errors.employment_status?.message}>
                  <SelectInput {...register("employment_status")} placeholder="Select Status" options={employmentStatusesOptions} />
                </InputField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Home Ownership" icon={<MdHome />} error={errors.home_ownership_status?.message}>
                  <SelectInput {...register("home_ownership_status")} placeholder="Select Status" options={homeOwnershipStatusesOptions} />
                </InputField>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* --- 6. Geography --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Buyer Geo */}
          <SectionCard stepNumber={6} title="Buyer Geography" bgColor="bg-indigo-50" textColor="text-indigo-600">
            <div className="grid grid-cols-12 gap-x-4 gap-y-5">
              {['Country', 'State', 'Counties', 'City', 'Districts', 'Parish'].map((field) => (
                <div key={field} className="col-span-12 sm:col-span-6">
                  <InputField label={field} icon={<MdLocationOn />} error={(errors as any)[`buyer_${field.toLowerCase()}`]?.message}>
                    <TextInput {...register(`buyer_${field.toLowerCase()}` as any)} placeholder={field} />
                  </InputField>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Seller Geo */}
          <SectionCard stepNumber={7} title="Seller Geography & Keywords" bgColor="bg-cyan-50" textColor="text-cyan-600">
            <div className="grid grid-cols-12 gap-x-4 gap-y-5">
              {['Country', 'State', 'Counties', 'City', 'Districts', 'Parish'].map((field) => (
                <div key={field} className="col-span-12 sm:col-span-6">
                  <InputField label={field} icon={<MdLocationOn />} error={(errors as any)[`seller_${field.toLowerCase()}`]?.message}>
                    <TextInput {...register(`seller_${field.toLowerCase()}` as any)} placeholder={field} />
                  </InputField>
                </div>
              ))}
              <div className="col-span-12">
                <label className={labelStyle} style={{ color: currentTheme.headingColor }}>Seller Keywords</label>
                <TextArea {...register("seller_keywords")} rows={3} maxLength={1000} placeholder="motivated seller, distressed property..." />
                {errors.seller_keywords && <p className="text-red-500 text-xs mt-1 font-medium  p-1 rounded">{errors.seller_keywords.message}</p>}
              </div>
            </div>
          </SectionCard>
        </div>

      </form>
    </div>
  );
}
