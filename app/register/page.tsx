import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
import { BrandStripe, Wordmark } from "@/components/wordmark";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <BrandStripe />
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
          <Wordmark />
        </div>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-bold">Apply for a trade account</h1>
        <p className="mb-6 mt-1 text-sm text-neutral-600">
          Enertec will verify your business and allocate your pricing. You can sign in straight away and see the range;
          prices appear once you’re approved.
        </p>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link href="/" className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
