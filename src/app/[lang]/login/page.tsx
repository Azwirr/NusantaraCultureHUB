import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { auth } = await getDictionary();
  return { title: auth.login.title, robots: { index: false, follow: false } };
}

export default async function LoginPage() {
  const { auth } = await getDictionary();
  return (
    <div className="page-container py-8 md:py-12">
      <div className="mx-auto w-full max-w-md">
        <PageHeader kicker={auth.login.kicker} title={auth.login.title} lead={auth.login.lead} />
        <Card className="p-5 md:p-6">
          <LoginForm copy={{ login: auth.login, fields: auth.fields, errors: auth.errors }} />
        </Card>
      </div>
    </div>
  );
}
