import type { AppState } from "./useStore";
import { users, companies, companyMembers } from "./seedUsers";
import { jobs } from "./seedJobs";
import { candidateProfiles } from "./seedCandidates";
import { applications, candidateMatches, interviews, notifications } from "./seedApplications";
import { massiveCompanies, massiveJobs } from "./seedMassive";

export function generateDemoData(): Partial<AppState> {
  return {
    users,
    companies: [...companies, ...massiveCompanies],
    companyMembers,
    jobs: [...jobs, ...massiveJobs],
    candidateProfiles,
    applications,
    candidateMatches,
    interviews,
    notifications,
    currentUser: users[0], // default to admin or can be overridden on login
  };
}

export function resetDemoData() {
  localStorage.removeItem("hireflow-storage");
  localStorage.removeItem("hireflow-storage-v2");
  localStorage.removeItem("hireflow-storage-v3");
  localStorage.removeItem("hireflow-storage-v4");
  window.location.href = "/";
}
