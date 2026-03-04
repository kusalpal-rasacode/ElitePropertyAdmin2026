"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import {
  MdSave,
  MdLocationOn,
  MdHome,
  MdAttachMoney,
  MdBuild,
  MdCalendarToday,
  MdBathtub,
  MdSquareFoot,
  MdGarage,
  MdDirectionsCar,
  MdAspectRatio,
  MdConstruction,
  MdBrush,
  MdRealEstateAgent,
  MdLocalOffer,
  MdMoneyOff,
  MdApartment,
  MdMap,
  MdPlace,
  MdKingBed,
} from "react-icons/md";
import {
  propertyTypeOptions,
  roofStatusOptions,
  interiorConditionOptions,
  transactionTypeOptions,
  listingTypeOptions,
  rentFrequencyOptions,
  smokingPolicyOptions,
  utilityOptions,
  amenityOptions,
  PropertyFormData,
  getInitialFormData,
  propertyListingSchema
} from "@/utils/propertyFormUtils";
import { PageHeader } from "@/components/common/Pageheader";
import { SectionCard } from "@/components/common/Sectioncard";
import { InputField } from "@/components/common/InputField";
import { TextInput } from "@/components/common/Textinput";
import { SelectInput } from "@/components/common/Selectinput";
import { TextArea } from "@/components/common/Textarea";
import { CheckboxButton } from "@/components/common/Checkboxbutton";
import { FileUpload } from "@/components/common/Fileupload";
import { Button } from "@/components/common/Button";
import { ErrorMessage } from "./ErrorMessage";

const MdPinDropIcon = MdLocationOn;

interface PropertyFormProps {
  mode: "add" | "edit";
  initialData?: any;
  existingImages?: string[];
  onSubmit: (formData: FormData) => Promise<void> | void;
  loading?: boolean;
  backUrl?: string;
}

export default function PropertyForm({
  mode,
  initialData,
  existingImages = [],
  onSubmit,
  loading = false,
  backUrl = "/properties",
}: PropertyFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";

  const {
    register,
    handleSubmit: hookFormSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<PropertyFormData>({
    resolver: yupResolver(propertyListingSchema) as any,
    defaultValues: initialData || { ...getInitialFormData(), listing_type: "Sale" }
  });

  const formDataImages = watch("images");
  const listingType = watch("listing_type");

  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach(key => {
        setValue(key as any, initialData[key]);
      });
    }
  }, [initialData, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setValue("images", Array.from(e.target.files), { shouldValidate: true });
    }
  };

  const submitForm = async (data: PropertyFormData) => {
    if (!isEditMode && (!data.images || data.images.length === 0)) {
      setError("images", { type: "manual", message: "At least one property image is required" });
      return;
    }

    try {
      console.log("Submit Form Data: ", data);
      const submitFormData = new FormData();
      const excludeFields = [
        "listing_type",
        "rent_price",
        "rent_frequency",
        "security_deposit",
        "available_from",
        "lease_duration",
        "is_furnished",
        "pets_allowed",
        "application_fee",
        "move_in_fees",
        "smoking_policy",
        "utilities_included",
        "amenities",
        "status"
      ];

      Object.entries(data).forEach(([key, value]) => {
        if (
          key !== "images" &&
          !excludeFields.includes(key) &&
          value !== null &&
          value !== undefined &&
          value !== ""
        ) {
          submitFormData.append(key, String(value));
        }
      });
      if (data.images && Array.isArray(data.images)) {
        data.images.forEach((file) => {
          if (file instanceof File) submitFormData.append("images", file);
        });
      }
      await onSubmit(submitFormData);
    } catch (error: any) {
      console.error("Form submission error:", error);
      alert(error.message || "Failed to submit form. Please try again.");
    }
  };

  const onInvalid = (errors: any) => {
    console.error("Validation Errors:", errors);
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      const el = document.querySelector(`[name="${firstErrorKey}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSubmit = hookFormSubmit(submitForm, onInvalid);
  const getFieldError = (fieldName: string): string | undefined => (errors as any)?.[fieldName]?.message;

  return (
    <div className="max-w-[1600px] mx-auto pb-20 fade-in-up">
      <PageHeader
        backLink={backUrl}
        title={isEditMode ? "Edit Property" : "Add Property"}
        subtitle={isEditMode ? "Update details" : "Create a new property listing"}
        actions={
          <>
            <Button variant="secondary" onClick={() => router.push(backUrl)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              icon={<MdSave size={18} />}
              disabled={loading}
            >
              {loading ? "Saving..." : isEditMode ? "Update Property" : "Save Property"}
            </Button>
          </>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" {...register("listing_type")} value="Sale" />

        {/* ADDRESS & SPECS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SectionCard stepNumber={1} title="Property Address">
            <div className="grid grid-cols-12 gap-x-4 gap-y-5">
              <div className="col-span-12 lg:col-span-8">
                <InputField label="Street Address" icon={<MdLocationOn />} required>
                  <TextInput required placeholder="123 Main St" {...register("street_address")} />
                </InputField>
                <ErrorMessage error={getFieldError("street_address")} />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <InputField label="Unit/Apt" icon={<MdApartment />} required>
                  <TextInput required placeholder="Apt 4B" {...register("unit_apt")} />
                </InputField>
                <ErrorMessage error={getFieldError("unit_apt")} />
              </div>

              <div className="col-span-12 sm:col-span-6">
                <InputField label="City" icon={<MdLocationOn />} required>
                  <TextInput required placeholder="City" {...register("city")} />
                </InputField>
                <ErrorMessage error={getFieldError("city")} />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="County" icon={<MdMap />} required>
                  <TextInput required placeholder="County" {...register("county")} />
                </InputField>
                <ErrorMessage error={getFieldError("county")} />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <InputField label="State" icon={<MdPlace />} required>
                  <TextInput required placeholder="State" {...register("state")} />
                </InputField>
                <ErrorMessage error={getFieldError("state")} />
              </div>
              <div className="col-span-6 sm:col-span-6">
                <InputField label="Zip Code" icon={<MdPinDropIcon />} required>
                  <TextInput required placeholder="Zip" {...register("zip_code")} />
                </InputField>
                <ErrorMessage error={getFieldError("zip_code")} />
              </div>
            </div>
          </SectionCard>

          <SectionCard stepNumber={2} title="Property Specs">
            <div className="grid grid-cols-12 gap-x-4 gap-y-5">
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Property Type" icon={<MdHome />} required>
                  <SelectInput required {...register("property_type")} options={propertyTypeOptions.map((opt) => opt.value)} />
                </InputField>
                <ErrorMessage error={getFieldError("property_type")} />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Year Built" icon={<MdCalendarToday />} required>
                  <TextInput required type="number" placeholder="2020" {...register("year_built")} />
                </InputField>
                <ErrorMessage error={getFieldError("year_built")} />
              </div>
              <div className="col-span-12 sm:col-span-4">
                <InputField label="Lot Size" icon={<MdAspectRatio />} required>
                  <TextInput required placeholder="0.25 acres" {...register("lot_size")} />
                </InputField>
                <ErrorMessage error={getFieldError("lot_size")} />
              </div>

              <div className="col-span-12 sm:col-span-4">
                <InputField label="Bedrooms" icon={<MdKingBed />} required>
                  <TextInput required type="number" placeholder="3" {...register("bedrooms")} />
                </InputField>
                <ErrorMessage error={getFieldError("bedrooms")} />
              </div>
              <div className="col-span-12 sm:col-span-4">
                <InputField label="Bathrooms" icon={<MdBathtub />} required>
                  <TextInput required type="number" placeholder="2" {...register("bathrooms")} />
                </InputField>
                <ErrorMessage error={getFieldError("bathrooms")} />
              </div>

              <div className="col-span-12 sm:col-span-4">
                <InputField label="Square Feet" icon={<MdSquareFoot />} required>
                  <TextInput required type="number" placeholder="1500" {...register("square_feet")} />
                </InputField>
                <ErrorMessage error={getFieldError("square_feet")} />
              </div>

              <div className="col-span-6 sm:col-span-4">
                <InputField label="Garage" icon={<MdGarage />}>
                  <TextInput required type="number" placeholder="2" {...register("garage_spaces")} />
                </InputField>
                <ErrorMessage error={getFieldError("garage_spaces")} />
              </div>
              <div className="col-span-6 sm:col-span-4">
                <InputField label="Parking" icon={<MdDirectionsCar />}>
                  <TextInput required type="number" placeholder="4" {...register("parking_spaces")} />
                </InputField>
                <ErrorMessage error={getFieldError("parking_spaces")} />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* CONDITION & ADDITIONAL INFO */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SectionCard
            stepNumber={3}
            title="Condition"
            bgColor="bg-orange-50"
            textColor="text-orange-600"
          >
            <div className="grid grid-cols-12 gap-x-4 gap-y-5 mb-5">
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Roof Age" required icon={<MdCalendarToday />}>
                  <TextInput required placeholder="Yr" {...register("roof_age")} />
                </InputField>
                <ErrorMessage error={getFieldError("roof_age")} />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <InputField label="Roof Status" required icon={<MdConstruction />}>
                  <SelectInput required {...register("roof_status")} options={roofStatusOptions.map((opt) => opt.value)} />
                </InputField>
                <ErrorMessage error={getFieldError("roof_status")} />
              </div>
              <div className="col-span-12">
                <InputField label="Interior Condition" icon={<MdBrush />}>
                  <SelectInput required {...register("interior_condition")} options={interiorConditionOptions.map((opt) => opt.value)} />
                </InputField>
                <ErrorMessage error={getFieldError("interior_condition")} />
              </div>
            </div>

            <div className="flex-1">
              <InputField label="Renovations Required?">
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { name: "exterior_paint_required", label: "Ext. Paint" },
                    { name: "new_floor_required", label: "New Floors" },
                    { name: "kitchen_renovation_required", label: "Kitchen" },
                    { name: "bathroom_renovation_required", label: "Bathrooms" },
                    { name: "drywall_repair_required", label: "Drywall" },
                    { name: "interior_paint_required", label: "Int. Paint" },
                  ].map((item) => (
                    <CheckboxButton
                      key={item.name}
                      label={item.label}
                      {...register(item.name as keyof PropertyFormData)}
                      checked={!!watch(item.name as keyof PropertyFormData)}
                    />
                  ))}
                </div>
              </InputField>
            </div>
          </SectionCard>

          <SectionCard
            stepNumber={4}
            title="Additional Info"
            bgColor="bg-gray-100"
            textColor="text-gray-600"
          >
            <div className="flex flex-col gap-5 flex-1">
              <div className="flex-1">
                <InputField label="Property Description">
                  <TextArea placeholder="Description..." {...register("property_description")} className="h-32" />
                </InputField>
                <ErrorMessage error={getFieldError("property_description")} />
              </div>
              <div className="flex-1">
                <InputField label="Seller Notes (Private)">
                  <TextArea placeholder="Notes..." {...register("seller_notes")} className="h-24" />
                </InputField>
                <ErrorMessage error={getFieldError("seller_notes")} />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* FINANCIALS (FULL WIDTH) */}
        <SectionCard
          stepNumber={5}
          title="Financials"
          bgColor="bg-emerald-50"
          textColor="text-emerald-600"
        >
          <div className="grid grid-cols-12 gap-x-4 gap-y-5">
            {/* SALE FIELDS */}
            {(listingType === "Sale" || listingType === "Both") && (
              <>
                <div className="col-span-12">
                  <h4 className="font-bold text-gray-700 border-b border-gray-200 pb-2 mb-2 flex items-center gap-2">
                    For Sale Details
                  </h4>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <InputField label="Listing Price" icon={<span className="font-bold">$</span>} required>
                    <TextInput required type="number" placeholder="0" {...register("listing_price")} style={{ fontWeight: "bold" }} />
                  </InputField>
                  <ErrorMessage error={getFieldError("listing_price")} />
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <InputField label="Asking Price" icon={<span className="font-bold">$</span>} required>
                    <TextInput required type="number" placeholder="0" {...register("asking_price")} style={{ fontWeight: "bold" }} />
                  </InputField>
                  <ErrorMessage error={getFieldError("asking_price")} />
                </div>

                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <InputField label="Transaction Type" icon={<MdRealEstateAgent />} required>
                    <SelectInput required {...register("transaction_type")} options={transactionTypeOptions.map((opt) => opt.value)} />
                  </InputField>
                  <ErrorMessage error={getFieldError("transaction_type")} />
                </div>

                {[
                  { n: "arv", l: "ARV", i: <MdLocalOffer /> },
                  { n: "repair_estimate", l: "Repair Estimate", i: <MdBuild /> },
                  { n: "holding_costs", l: "Holding Costs", i: <MdMoneyOff /> },
                  { n: "assignment_fee", l: "Assignment Fee", i: <MdAttachMoney /> },
                ].map((f) => (
                  <div key={f.n} className="col-span-12 sm:col-span-6 lg:col-span-3">
                    <InputField label={f.l} icon={f.i} required>
                      <TextInput required type="number" placeholder="0" {...register(f.n as any)} />
                    </InputField>
                    <ErrorMessage error={getFieldError(f.n)} />
                  </div>
                ))}
              </>
            )}


          </div>
        </SectionCard>

        {/* IMAGES */}
        <SectionCard
          stepNumber={6}
          title="Property Images"
          bgColor="bg-indigo-50"
          textColor="text-indigo-600"
        >
          <FileUpload
            id="file-upload-smart"
            onChange={handleFileChange}
            fileCount={formDataImages && Array.isArray(formDataImages) ? formDataImages.length : 0}
          />
          {isEditMode && (!formDataImages || formDataImages.length === 0) && (
            <p className="mt-2 text-sm text-gray-500">
              No new images selected. Existing images will be preserved.
            </p>
          )}
          <ErrorMessage error={getFieldError("images")} />
        </SectionCard>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => router.push(backUrl)}>
            Cancel
          </Button>
          <Button
             variant="primary"
              onClick={handleSubmit}
              icon={<MdSave size={18} />}
              disabled={loading}
            >
              {loading ? "Saving..." : isEditMode ? "Update Property" : "Save Property"}
          </Button>
        </div>
      </form>
    </div>
  );
}
