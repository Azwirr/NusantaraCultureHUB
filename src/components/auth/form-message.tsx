import { CircleAlert, CircleCheck } from "lucide-react";

/** Inline result of an auth form: an error alert or a success status note. */
export function FormMessage({
  id,
  tone,
  title,
  children,
}: {
  id?: string;
  tone: "error" | "success";
  title?: string;
  children: string;
}) {
  const isError = tone === "error";
  const Icon = isError ? CircleAlert : CircleCheck;
  return (
    <div
      id={id}
      role={isError ? "alert" : "status"}
      className={[
        "flex items-start gap-3 rounded border p-4 text-body-md",
        isError
          ? "border-error bg-error-container text-on-error-container"
          : "border-ink bg-primary-container text-on-primary-container",
      ].join(" ")}
    >
      <Icon aria-hidden="true" size={20} strokeWidth={1.75} className="mt-0.5 shrink-0" />
      <div className="flex flex-col gap-1">
        {title ? <p className="text-label-md">{title}</p> : null}
        <p>{children}</p>
      </div>
    </div>
  );
}
