"use client";

import { Field, TextInput, SelectInput } from "./FormFields";

interface PriceFieldsProps {
  price: string;
  currency: string;
  onPriceChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  label?: string;
}

export function PriceFields({
  price,
  currency,
  onPriceChange,
  onCurrencyChange,
  label = "Price",
}: PriceFieldsProps) {
  return (
    <div className="grid grid-cols-1 min-[425px]:grid-cols-3 gap-3">
      <div className="min-[425px]:col-span-2">
        <Field label={label} required>
          <TextInput
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            required
          />
        </Field>
      </div>
      <Field label="Currency" required>
        <SelectInput
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
        >
          <option value="USD">USD</option>
          <option value="LKR">LKR</option>
        </SelectInput>
      </Field>
    </div>
  );
}
