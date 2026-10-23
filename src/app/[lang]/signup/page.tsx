import type { Metadata } from "next";

import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { SignupForm } from "@/components/auth/signup-form";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { auth } = await getDictionary();
  return { title: auth.signup.title, robots: { index: false, follow: false } };
}

export default async function SignupPage() {
  const { auth } = await getDictionary();
  return (
    <div className="page-container py-8 md:py-12">
      <div className="mx-auto w-full max-w-md">
        <PageHeader kicker={auth.signup.kicker} title={auth.signup.title} lead={auth.signup.lead} />
        <Card className="flex flex-col gap-5 p-5 md:p-6">
          <GoogleSignIn copy={auth.google} />
          <SignupForm
            copy={{
              signup: auth.signup,
              fields: auth.fields,
              errors: auth.errors,
              checkEmailTitle: auth.checkEmailTitle,
              checkEmailBody: auth.checkEmailBody,
            }}
          />
        </Card>
      </div>
    </div>
  );
}
