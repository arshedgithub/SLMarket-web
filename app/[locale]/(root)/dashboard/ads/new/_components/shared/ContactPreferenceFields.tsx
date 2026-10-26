import { Phone, PhoneOff } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Field, TextInput, Toggle } from "./FormFields";

interface ContactPreferenceFieldsProps {
  contactPhone: string;
  onContactPhoneChange: (value: string) => void;
  hideContactPhone: boolean;
  onHideContactPhoneChange: (value: boolean) => void;
  whatsappEnabled: boolean;
  onWhatsappEnabledChange: (value: boolean) => void;
  whatsappNumber: string;
  onWhatsappNumberChange: (value: string) => void;
  contactPhoneError?: string;
  whatsappNumberError?: string;
}

export function ContactPreferenceFields({
  contactPhone,
  onContactPhoneChange,
  hideContactPhone,
  onHideContactPhoneChange,
  whatsappEnabled,
  onWhatsappEnabledChange,
  whatsappNumber,
  onWhatsappNumberChange,
  contactPhoneError,
  whatsappNumberError,
}: ContactPreferenceFieldsProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-4">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Contact Preference
      </p>

      <Field
        label="Contact Phone"
        name="contactPhone"
        hint="Buyers will see this number on the listing. Leave blank to use your profile number."
        error={contactPhoneError}
      >
        <TextInput
          type="tel"
          placeholder="+94 77 123 4567"
          value={contactPhone}
          onChange={(e) => onContactPhoneChange(e.target.value)}
        />
      </Field>

      <Toggle
        checked={!hideContactPhone}
        onChange={(checked) => onHideContactPhoneChange(!checked)}
        label="Show phone number"
        hint="Buyers see your number on the listing. Turn off to receive enquiries through site messages only."
        onIcon={Phone}
        offIcon={PhoneOff}
      />

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
        <Toggle
          checked={whatsappEnabled}
          onChange={onWhatsappEnabledChange}
          label="Enable WhatsApp for this listing"
          hint="Show a WhatsApp button so buyers can message you directly."
          onIcon={WhatsAppIcon}
          offIcon={WhatsAppIcon}
          color="green"
        />

        {whatsappEnabled && (
          <Field
            label="WhatsApp Number"
            name="whatsappNumber"
            hint="Can be a different number from your contact phone above."
            error={whatsappNumberError}
          >
            <TextInput
              type="tel"
              placeholder="+94 77 123 4567"
              value={whatsappNumber}
              onChange={(e) => onWhatsappNumberChange(e.target.value)}
            />
          </Field>
        )}
      </div>
    </div>
  );
}
