import React from "react";

export default function ProfileSection({
  icon,
  children,
  title,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="flex items-center font-bold gap-2">
        <div>{icon}</div>
        {title}
      </h3>
      <div className="flex gap-4 flex-col">{children}</div>
    </section>
  );
}
