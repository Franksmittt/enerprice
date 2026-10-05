"use client";

import { useActionState } from "react";
import { register } from "@/app/actions";

const FIELDS = [
  { name: "company", label: "Company / trading name", type: "text", autoComplete: "organization" },
  { name: "contact", label: "Contact person", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
];

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);
  return (
    <form action={action} className="space-y-4">
      {FIELDS.map((f) => (
        <label key={f.name} className="block">
          <span className="text-sm font-medium">{f.label}</span>
          <input
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            required={f.name !== "phone"}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2.5 outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </label>
      ))}
      {state?.error && <p className="rounded-md bg-alert/10 px-3 py-2 text-sm text-alert-dark">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-md bg-brand py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Apply for access"}
      </button>
    </form>
  );
}
