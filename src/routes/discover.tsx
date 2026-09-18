import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { DiscoverForm } from "@/features/discover/discover-form";

export const Route = createFileRoute("/discover")({ component: DiscoverPage });

function DiscoverPage() {
  return (
    <div className="page-container">
      <Link to="/" className="back-link">
        <ArrowLeft size={17} />
        {" "}
        Back to catalog
      </Link>
      <DiscoverForm />
    </div>
  );
}
