"use client";

import { useActionState, useRef } from "react";
import { login } from "@/app/actions";

type Demo = { label: string; email: string; password: string };

export function LoginForm({ demos }: { demos: Demo[] }) {
  const [state, action, pending] = useActionState(login, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  function fill(demo: Demo) {
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem("email") as HTMLInputElement).value = demo.email;
    (form.elements.namedItem("password") as HTMLInputElement).value = demo.password;
  }

  return (
    <div className="space-y-5">
      <form ref={formRef} action={action} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2.5 outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2.5 outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </label>
        {state?.error && <p className="rounded-md bg-alert/10 px-3 py-2 text-sm text-alert-dark">{state.error}</p>}
        <button
          disabled={pending}
          className="w-full rounded-md bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="rounded-lg border border-dashed border-neutral-300 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Demo logins</p>
        <div className="mt-2 grid gap-2">
          {demos.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => fill(d)}
              className="flex min-w-0 flex-col gap-0.5 rounded-md bg-neutral-50 px-3 py-2 text-left text-sm hover:bg-neutral-100"
            >
              <span className="font-medium">{d.label}</span>
              <span className="truncate font-mono text-xs text-neutral-500">{d.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
