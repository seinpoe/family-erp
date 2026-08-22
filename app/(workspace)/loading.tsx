import React from "react";
import { WorkspaceLoadingState } from "@/components/workspace-loading-state";

export default function WorkspaceLoading() {
  return <main className="container pb-28 pt-5 sm:py-10" aria-busy="true" aria-label="Loading household workspace"><WorkspaceLoadingState /></main>;
}
