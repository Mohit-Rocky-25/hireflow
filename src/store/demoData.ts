import type { AppState } from "./types";
import { users, companies, companyMembers } from "./seedUsers";
import { jobs } from "./seedJobs";
import { candidateProfiles } from "./seedCandidates";
import { applications, candidateMatches, interviews, notifications } from "./seedApplications";

export function generateDemoData(): Partial<AppState> {
  return {
    users,
    companies,
    companyMembers,
    jobs,
    candidateProfiles,
    applications,
    candidateMatches,
    interviews,
    notifications,
    currentUser: users[0], // default to admin or can be overridden on login
  };
}

export function resetDemoData() {
// Obsolete demo data wipe helper — browser user persistence is retired.
  window.location.href = "/";
}
