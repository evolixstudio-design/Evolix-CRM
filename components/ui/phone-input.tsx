"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CountryOption {
  code: string; // ISO 2 code (e.g. IN, US)
  dialCode: string; // e.g. +91
  flag: string; // Emoji flag
  name: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: "IN", dialCode: "+91", flag: "🇮🇳", name: "India" },
  { code: "US", dialCode: "+1", flag: "🇺🇸", name: "United States / Canada" },
  { code: "GB", dialCode: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "AE", dialCode: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "SA", dialCode: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "QA", dialCode: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "KW", dialCode: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "OM", dialCode: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "BH", dialCode: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "SG", dialCode: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "MY", dialCode: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "ID", dialCode: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "PK", dialCode: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "BD", dialCode: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "NP", dialCode: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "LK", dialCode: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "PH", dialCode: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "TH", dialCode: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "VN", dialCode: "+84", flag: "🇻🇳", name: "Vietnam" },
  { code: "AU", dialCode: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "NZ", dialCode: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "DE", dialCode: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "FR", dialCode: "+33", flag: "🇫🇷", name: "France" },
  { code: "IT", dialCode: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "ES", dialCode: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "NL", dialCode: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "CH", dialCode: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "SE", dialCode: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "NO", dialCode: "+47", flag: "🇳🇴", name: "Norway" },
  { code: "DK", dialCode: "+45", flag: "🇩🇰", name: "Denmark" },
  { code: "ZA", dialCode: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "EG", dialCode: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "NG", dialCode: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "KE", dialCode: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "JP", dialCode: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "KR", dialCode: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "CN", dialCode: "+86", flag: "🇨🇳", name: "China" },
  { code: "HK", dialCode: "+852", flag: "🇭🇰", name: "Hong Kong" },
  { code: "TW", dialCode: "+886", flag: "🇹🇼", name: "Taiwan" },
  { code: "BR", dialCode: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "MX", dialCode: "+52", flag: "🇲🇽", name: "Mexico" },
  { code: "AR", dialCode: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "TR", dialCode: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "RU", dialCode: "+7", flag: "🇷🇺", name: "Russia" },
];

export interface PhoneInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function PhoneInput({
  label,
  value,
  onChange,
  placeholder = "98765 43210",
  required = false,
  disabled = false,
  error,
  className,
}: PhoneInputProps) {
  // Parse initial dial code & number from full value
  const parsePhoneValue = React.useCallback((fullValue: string) => {
    if (!fullValue) return { selectedDialCode: "+91", phoneNumber: "" };
    const clean = fullValue.trim();
    const matchedCountry = COUNTRIES.find((c) => clean.startsWith(c.dialCode));

    if (matchedCountry) {
      const restNumber = clean.slice(matchedCountry.dialCode.length).trim();
      return { selectedDialCode: matchedCountry.dialCode, phoneNumber: restNumber };
    }

    if (clean.startsWith("+")) {
      const parts = clean.split(" ");
      return { selectedDialCode: parts[0], phoneNumber: parts.slice(1).join(" ") };
    }

    return { selectedDialCode: "+91", phoneNumber: clean };
  }, []);

  const { selectedDialCode: initialDialCode, phoneNumber: initialNumber } = React.useMemo(
    () => parsePhoneValue(value),
    [value, parsePhoneValue]
  );

  const [selectedDialCode, setSelectedDialCode] = React.useState(initialDialCode);
  const [phoneNumber, setPhoneNumber] = React.useState(initialNumber);

  React.useEffect(() => {
    const { selectedDialCode: d, phoneNumber: n } = parsePhoneValue(value);
    setSelectedDialCode(d);
    setPhoneNumber(n);
  }, [value, parsePhoneValue]);

  const handleDialCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedDialCode(newCode);
    if (phoneNumber.trim()) {
      onChange(`${newCode} ${phoneNumber.trim()}`);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    setPhoneNumber(rawInput);
    if (!rawInput.trim()) {
      onChange("");
    } else {
      onChange(`${selectedDialCode} ${rawInput.trim()}`);
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-xs font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="flex rounded-lg border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-slate-900 overflow-hidden shadow-xs">
        {/* Country Selector */}
        <select
          value={selectedDialCode}
          onChange={handleDialCodeChange}
          disabled={disabled}
          className="bg-slate-50 border-r border-slate-200 px-2 py-2 text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.dialCode}>
              {c.flag} {c.dialCode}
            </option>
          ))}
        </select>

        {/* Local Number Field */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handleNumberChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
