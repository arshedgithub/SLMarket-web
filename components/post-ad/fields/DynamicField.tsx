"use client";

import type { ListingField } from "@/config/const/listingFields";
import {
  ChipGroup,
  FieldShell,
  NumberField,
  SegmentedControl,
  Stepper,
  TextField,
  ToggleRow,
} from "./Primitives";

type Value = string | number | boolean | undefined;

export function DynamicField({
  field,
  value,
  onChange,
  error,
}: {
  field: ListingField;
  value: Value;
  onChange: (value: string | number | boolean) => void;
  error?: string;
}) {
  if (field.type === "toggle") {
    return (
      <ToggleRow
        label={field.label}
        hint={field.hint}
        checked={Boolean(value)}
        onChange={(v) => onChange(v)}
      />
    );
  }

  return (
    <FieldShell
      label={field.label}
      required={field.required}
      hint={field.hint}
      error={error}
    >
      {field.type === "segmented" && (
        <SegmentedControl
          options={field.options ?? []}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
        />
      )}

      {(field.type === "chips" || field.type === "multichips") && (
        <ChipGroup
          options={field.options ?? []}
          multi={field.type === "multichips"}
          value={
            field.type === "multichips"
              ? typeof value === "string" && value
                ? value.split("|")
                : []
              : typeof value === "string"
                ? value
                : ""
          }
          onChange={(v) => onChange(Array.isArray(v) ? v.join("|") : v)}
        />
      )}

      {field.type === "stepper" && (
        <Stepper
          value={typeof value === "number" ? value : ""}
          min={field.min ?? 0}
          max={field.max ?? 99}
          onChange={onChange}
        />
      )}

      {field.type === "number" && (
        <NumberField
          value={value === undefined ? "" : String(value)}
          unit={field.unit}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          onChange={onChange}
        />
      )}

      {field.type === "text" && (
        <TextField
          value={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </FieldShell>
  );
}
