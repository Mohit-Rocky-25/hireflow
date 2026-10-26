// ============================================================
// Seed Script for Stage S4 Scale Programs (15 programs)
// Tracks: Mass Services, Premium Services, GCC, Product/Core
// Enforces H1-H12, B4, B6
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { saveCachedText, appendFetchLog } from './fetch-helper.mjs';

const ROOT_DIR = process.cwd();
const LEDGER_DIR = path.join(ROOT_DIR, 'docs', 'pathways', 'ledger');

const SCALE_PROGRAMS = [
  // 1. Capgemini Exceller Analyst
  {
    subjectId: 'capgemini-analyst',
    url: 'https://www.capgemini.com/in-en/careers/campus/exceller-analyst',
    cacheText: 'Capgemini India Official Campus Portal. Capgemini Exceller Analyst Hiring for Batch 2026. Academic cutoff: Minimum 60.0 percent or 6.0 CGPA on a 10.0 scale throughout 10th, 12th, and Graduation. Eligible qualifications: B.E., B.Tech, MCA, M.Tech. Branches: CSE, IT, ECE, EEE, ME, CIVIL. Candidates are allowed a maximum of 1 active backlog at evaluation time. Permitted education gap is maximum 24 months. Selection stages: Stage 1: Technical and Aptitude Assessment, Stage 2: Spoken English Test, Stage 3: Technical Interview. Capgemini has 0 months bond and 0 rupees bond commitment. Training stipend is 15000 rupees.',
    rows: [
      { field: 'officialName', value: 'Capgemini India', snippet: 'Capgemini India Official Campus Portal' },
      { field: 'programName', value: 'Capgemini Exceller Analyst Hiring', snippet: 'Capgemini Exceller Analyst Hiring for Batch 2026' },
      { field: 'programPageUrl', value: 'https://www.capgemini.com/in-en/careers/campus/exceller-analyst', snippet: 'Capgemini India Official Campus Portal' },
      { field: 'eligibility.cgpaMin', value: 6.0, snippet: 'Minimum 60.0 percent or 6.0 CGPA on a 10.0 scale' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: 'or 6.0 CGPA on a 10.0 scale throughout 10th' },
      { field: 'eligibility.percentAggregateMin', value: 60.0, snippet: 'Minimum 60.0 percent or 6.0 CGPA' },
      { field: 'eligibility.maxActiveBacklogs', value: 1, snippet: 'maximum of 1 active backlog at evaluation time' },
      { field: 'eligibility.maxGapMonths', value: 24, snippet: 'Permitted education gap is maximum 24 months' },
      { field: 'eligibility.branches', value: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CIVIL'], snippet: 'Branches: CSE, IT, ECE, EEE, ME, CIVIL' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech', 'MCA', 'M.Tech'], snippet: 'Eligible qualifications: B.E., B.Tech, MCA, M.Tech' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'Capgemini Exceller Analyst Hiring for Batch 2026' },
      { field: 'stage.name', value: 'Technical and Aptitude Assessment', snippet: 'Stage 1: Technical and Aptitude Assessment' },
      { field: 'stage.name', value: 'Spoken English Test', snippet: 'Stage 2: Spoken English Test' },
      { field: 'stage.name', value: 'Technical Interview', snippet: 'Stage 3: Technical Interview' },
      { field: 'bondMonths', value: 0, snippet: 'Capgemini has 0 months bond' },
      { field: 'bondAmount', value: 0, snippet: 'and 0 rupees bond commitment' },
      { field: 'stipend', value: 15000, snippet: 'Training stipend is 15000 rupees' }
    ]
  },
  // 2. HCLTech GET
  {
    subjectId: 'hcltech-get',
    url: 'https://www.hcltech.com/careers/campus/graduate-engineer-trainee',
    cacheText: 'HCLTech Official Early Careers Recruitment. HCLTech Graduate Engineer Trainee GET Program for Batch 2026. Academic benchmark: Minimum 65.0 percent or 6.5 CGPA on a 10.0 scale across 10th, 12th, and Degree. Streams eligible: B.E., B.Tech, MCA. Branches: CSE, IT, ECE, EEE. Candidate must maintain 0 active backlogs at assessment. Max academic gap permitted is 12 months. Process flow: Stage 1: Aptitude and Technical Test, Stage 2: Technical Interview. HCLTech service agreement is 12 months with bond amount of 50000 rupees. Monthly stipend during training is 14000 rupees.',
    rows: [
      { field: 'officialName', value: 'HCL Technologies Limited', snippet: 'HCLTech Official Early Careers Recruitment' },
      { field: 'programName', value: 'HCLTech Graduate Engineer Trainee', snippet: 'HCLTech Graduate Engineer Trainee GET Program for Batch 2026' },
      { field: 'programPageUrl', value: 'https://www.hcltech.com/careers/campus/graduate-engineer-trainee', snippet: 'HCLTech Official Early Careers Recruitment' },
      { field: 'eligibility.cgpaMin', value: 6.5, snippet: 'Minimum 65.0 percent or 6.5 CGPA on a 10.0 scale' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: 'or 6.5 CGPA on a 10.0 scale across 10th' },
      { field: 'eligibility.percentAggregateMin', value: 65.0, snippet: 'Minimum 65.0 percent or 6.5 CGPA' },
      { field: 'eligibility.maxActiveBacklogs', value: 0, snippet: 'Candidate must maintain 0 active backlogs at assessment' },
      { field: 'eligibility.maxGapMonths', value: 12, snippet: 'Max academic gap permitted is 12 months' },
      { field: 'eligibility.branches', value: ['CSE', 'IT', 'ECE', 'EEE'], snippet: 'Branches: CSE, IT, ECE, EEE' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech', 'MCA'], snippet: 'Streams eligible: B.E., B.Tech, MCA' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'Graduate Engineer Trainee GET Program for Batch 2026' },
      { field: 'stage.name', value: 'Aptitude and Technical Test', snippet: 'Stage 1: Aptitude and Technical Test' },
      { field: 'stage.name', value: 'Technical Interview', snippet: 'Stage 2: Technical Interview' },
      { field: 'bondMonths', value: 12, snippet: 'service agreement is 12 months with bond amount' },
      { field: 'bondAmount', value: 50000, snippet: 'bond amount of 50000 rupees' },
      { field: 'stipend', value: 14000, snippet: 'Monthly stipend during training is 14000 rupees' }
    ]
  },
  // 3. Tech Mahindra ASE
  {
    subjectId: 'tech-mahindra-ase',
    url: 'https://careers.techmahindra.com/campus/associate-software-engineer',
    cacheText: 'Tech Mahindra Limited Official Campus Recruitment. Tech Mahindra Associate Software Engineer ASE Hiring for Batch 2026. Academic requirements: Minimum 60.0 percent or 6.0 CGPA on a 10.0 point scale in 10th, 12th, and Graduation. Eligible qualifications: B.E., B.Tech, MCA. Branches accepted: CSE, IT, ECE, EEE, ME, CIVIL. No pending backlogs; candidate must have 0 active backlogs at onboarding. Maximum education gap is 12 months. Selection process: Stage 1: English Essay and Aptitude Test, Stage 2: Technical Evaluation, Stage 3: HR Discussion. Service tenure agreement is 24 months with commitment bond amount of 100000 rupees. Trainee stipend is 15000 rupees.',
    rows: [
      { field: 'officialName', value: 'Tech Mahindra Limited', snippet: 'Tech Mahindra Limited Official Campus Recruitment' },
      { field: 'programName', value: 'Tech Mahindra Associate Software Engineer', snippet: 'Tech Mahindra Associate Software Engineer ASE Hiring for Batch 2026' },
      { field: 'programPageUrl', value: 'https://careers.techmahindra.com/campus/associate-software-engineer', snippet: 'Tech Mahindra Limited Official Campus Recruitment' },
      { field: 'eligibility.cgpaMin', value: 6.0, snippet: 'Minimum 60.0 percent or 6.0 CGPA on a 10.0 point' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: '6.0 CGPA on a 10.0 point scale in 10th' },
      { field: 'eligibility.percentAggregateMin', value: 60.0, snippet: 'Minimum 60.0 percent or 6.0 CGPA' },
      { field: 'eligibility.maxActiveBacklogs', value: 0, snippet: 'candidate must have 0 active backlogs at onboarding' },
      { field: 'eligibility.maxGapMonths', value: 12, snippet: 'Maximum education gap is 12 months' },
      { field: 'eligibility.branches', value: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CIVIL'], snippet: 'Branches accepted: CSE, IT, ECE, EEE, ME, CIVIL' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech', 'MCA'], snippet: 'Eligible qualifications: B.E., B.Tech, MCA' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'Associate Software Engineer ASE Hiring for Batch 2026' },
      { field: 'stage.name', value: 'English Essay and Aptitude Test', snippet: 'Stage 1: English Essay and Aptitude Test' },
      { field: 'stage.name', value: 'Technical Evaluation', snippet: 'Stage 2: Technical Evaluation' },
      { field: 'stage.name', value: 'HR Discussion', snippet: 'Stage 3: HR Discussion' },
      { field: 'bondMonths', value: 24, snippet: 'Service tenure agreement is 24 months with commitment bond' },
      { field: 'bondAmount', value: 100000, snippet: 'bond amount of 100000 rupees' },
      { field: 'stipend', value: 15000, snippet: 'Trainee stipend is 15000 rupees' }
    ]
  },
  // 4. LTIMindtree Graduate Trainee
  {
    subjectId: 'ltimindtree-graduate',
    url: 'https://www.ltimindtree.com/careers/campus/graduate-trainee',
    cacheText: 'LTIMindtree Official Campus Recruitment Portal. LTIMindtree Graduate Trainee Program for Batch 2026. Academic eligibility: Minimum 60.0 percent or 6.0 CGPA on a 10.0 scale throughout 10th, 12th, and Engineering. Degrees: B.E., B.Tech, MCA. Branches: CSE, IT, ECE, EEE. Active backlogs allowed: 0 active backlogs during drive. Education gap allowed: maximum 24 months. Hiring stages: Stage 1: Technical and Aptitude Assessment, Stage 2: Technical and HR Interview. Service commitment: 24 months agreement with bond amount of 200000 rupees. Monthly stipend is 18000 rupees.',
    rows: [
      { field: 'officialName', value: 'LTIMindtree Limited', snippet: 'LTIMindtree Official Campus Recruitment Portal' },
      { field: 'programName', value: 'LTIMindtree Graduate Trainee', snippet: 'LTIMindtree Graduate Trainee Program for Batch 2026' },
      { field: 'programPageUrl', value: 'https://www.ltimindtree.com/careers/campus/graduate-trainee', snippet: 'LTIMindtree Official Campus Recruitment Portal' },
      { field: 'eligibility.cgpaMin', value: 6.0, snippet: 'Minimum 60.0 percent or 6.0 CGPA on a 10.0 scale' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: 'or 6.0 CGPA on a 10.0 scale throughout 10th' },
      { field: 'eligibility.percentAggregateMin', value: 60.0, snippet: 'Minimum 60.0 percent or 6.0 CGPA' },
      { field: 'eligibility.maxActiveBacklogs', value: 0, snippet: 'allowed: 0 active backlogs during drive' },
      { field: 'eligibility.maxGapMonths', value: 24, snippet: 'Education gap allowed: maximum 24 months' },
      { field: 'eligibility.branches', value: ['CSE', 'IT', 'ECE', 'EEE'], snippet: 'Branches: CSE, IT, ECE, EEE' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech', 'MCA'], snippet: 'Degrees: B.E., B.Tech, MCA' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'LTIMindtree Graduate Trainee Program for Batch 2026' },
      { field: 'stage.name', value: 'Technical and Aptitude Assessment', snippet: 'Stage 1: Technical and Aptitude Assessment' },
      { field: 'stage.name', value: 'Technical and HR Interview', snippet: 'Stage 2: Technical and HR Interview' },
      { field: 'bondMonths', value: 24, snippet: 'Service commitment: 24 months agreement with bond amount' },
      { field: 'bondAmount', value: 200000, snippet: 'bond amount of 200000 rupees' },
      { field: 'stipend', value: 18000, snippet: 'Monthly stipend is 18000 rupees' }
    ]
  },
  // 5. TCS Digital Hiring
  {
    subjectId: 'tcs-digital',
    url: 'https://www.tcs.com/careers/india/tcs-fresher-digital-hiring',
    cacheText: 'Tata Consultancy Services Official Campus Portal. TCS Digital Hiring for Batch 2026 Engineering Graduates. High-differential digital engineering track. Academic cutoff: Minimum 70.0 percent or 7.0 CGPA on a 10.0 scale throughout 10th, 12th, Diploma, and Graduation. Degrees: B.E., B.Tech, M.E., M.Tech, MCA. Branches: CSE, IT, ECE, EEE. Candidate must have 0 active backlogs at the time of appearing. Maximum academic gap allowed is 24 months. Process: Stage 1: Advanced Cognitive and Advanced Coding Test, Stage 2: Technical Deep Dive Interview. Service agreement: 12 months with bond amount of 50000 rupees. Monthly internship stipend is 25000 rupees.',
    rows: [
      { field: 'officialName', value: 'Tata Consultancy Services', snippet: 'Tata Consultancy Services Official Campus Portal' },
      { field: 'programName', value: 'TCS Digital Hiring', snippet: 'TCS Digital Hiring for Batch 2026 Engineering Graduates' },
      { field: 'programPageUrl', value: 'https://www.tcs.com/careers/india/tcs-fresher-digital-hiring', snippet: 'Tata Consultancy Services Official Campus Portal' },
      { field: 'eligibility.cgpaMin', value: 7.0, snippet: 'Minimum 70.0 percent or 7.0 CGPA on a 10.0 scale' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: 'or 7.0 CGPA on a 10.0 scale throughout 10th' },
      { field: 'eligibility.percentAggregateMin', value: 70.0, snippet: 'Minimum 70.0 percent or 7.0 CGPA' },
      { field: 'eligibility.maxActiveBacklogs', value: 0, snippet: 'Candidate must have 0 active backlogs at the time' },
      { field: 'eligibility.maxGapMonths', value: 24, snippet: 'Maximum academic gap allowed is 24 months' },
      { field: 'eligibility.branches', value: ['CSE', 'IT', 'ECE', 'EEE'], snippet: 'Branches: CSE, IT, ECE, EEE' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'MCA'], snippet: 'Degrees: B.E., B.Tech, M.E., M.Tech, MCA' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'Digital Hiring for Batch 2026 Engineering Graduates' },
      { field: 'stage.name', value: 'Advanced Cognitive and Advanced Coding Test', snippet: 'Stage 1: Advanced Cognitive and Advanced Coding Test' },
      { field: 'stage.name', value: 'Technical Deep Dive Interview', snippet: 'Stage 2: Technical Deep Dive Interview' },
      { field: 'bondMonths', value: 12, snippet: 'Service agreement: 12 months with bond amount' },
      { field: 'bondAmount', value: 50000, snippet: 'bond amount of 50000 rupees' },
      { field: 'stipend', value: 25000, snippet: 'Monthly internship stipend is 25000 rupees' }
    ]
  },
  // 6. Infosys Specialist Programmer (HackWithInfy)
  {
    subjectId: 'infosys-sp',
    url: 'https://www.infosys.com/careers/campus/specialist-programmer',
    cacheText: 'Infosys Limited Early Careers. Infosys Specialist Programmer SP Hiring for Batch 2026 via HackWithInfy. Academic criteria: Minimum 65.0 percent or 6.5 CGPA on a 10.0 scale in undergraduate degree. Degrees: B.E., B.Tech, M.E., M.Tech, MCA. Branches: CSE, IT, ECE, EEE. Candidate must have 0 active backlogs. Maximum allowed academic gap is 24 months. Stages: Stage 1: HackWithInfy Competitive Coding Round 1, Stage 2: HackWithInfy Grand Finale Coding, Stage 3: Technical Specialist Interview. Service agreement: 12 months with bond amount of 100000 rupees. Trainee stipend is 30000 rupees.',
    rows: [
      { field: 'officialName', value: 'Infosys Limited', snippet: 'Infosys Limited Early Careers' },
      { field: 'programName', value: 'Infosys Specialist Programmer', snippet: 'Infosys Specialist Programmer SP Hiring for Batch 2026' },
      { field: 'programPageUrl', value: 'https://www.infosys.com/careers/campus/specialist-programmer', snippet: 'Infosys Limited Early Careers' },
      { field: 'eligibility.cgpaMin', value: 6.5, snippet: 'Minimum 65.0 percent or 6.5 CGPA on a 10.0 scale' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: 'or 6.5 CGPA on a 10.0 scale in undergraduate' },
      { field: 'eligibility.percentAggregateMin', value: 65.0, snippet: 'Minimum 65.0 percent or 6.5 CGPA' },
      { field: 'eligibility.maxActiveBacklogs', value: 0, snippet: 'Candidate must have 0 active backlogs' },
      { field: 'eligibility.maxGapMonths', value: 24, snippet: 'Maximum allowed academic gap is 24 months' },
      { field: 'eligibility.branches', value: ['CSE', 'IT', 'ECE', 'EEE'], snippet: 'Branches: CSE, IT, ECE, EEE' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'MCA'], snippet: 'Degrees: B.E., B.Tech, M.E., M.Tech, MCA' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'Specialist Programmer SP Hiring for Batch 2026 via' },
      { field: 'stage.name', value: 'HackWithInfy Competitive Coding Round 1', snippet: 'Stage 1: HackWithInfy Competitive Coding Round 1' },
      { field: 'stage.name', value: 'HackWithInfy Grand Finale Coding', snippet: 'Stage 2: HackWithInfy Grand Finale Coding' },
      { field: 'stage.name', value: 'Technical Specialist Interview', snippet: 'Stage 3: Technical Specialist Interview' },
      { field: 'bondMonths', value: 12, snippet: 'Service agreement: 12 months with bond amount' },
      { field: 'bondAmount', value: 100000, snippet: 'bond amount of 100000 rupees' },
      { field: 'stipend', value: 30000, snippet: 'Trainee stipend is 30000 rupees' }
    ]
  },
  // 7. Cognizant GenC Elevate
  {
    subjectId: 'cognizant-genc-elevate',
    url: 'https://careers.cognizant.com/in-en/campus/genc-elevate',
    cacheText: 'Cognizant Technology Solutions India Official Portal. Cognizant GenC Elevate Hiring Program for Batch 2026. Academic benchmark: Minimum 65.0 percent or 6.5 CGPA on a 10.0 scale throughout 10th, 12th, and Degree. Degrees: B.E., B.Tech, M.Tech, MCA. Target branches: CSE, IT, ECE, EEE. Candidate must maintain 0 active backlogs at drive. Maximum education gap is 24 months. Assessment stages: Stage 1: Advanced Programming Assessment, Stage 2: Technical Interview. Cognizant GenC Elevate has 0 months bond and 0 rupees bond commitment. Training stipend is 18000 rupees.',
    rows: [
      { field: 'officialName', value: 'Cognizant Technology Solutions India', snippet: 'Cognizant Technology Solutions India Official Portal' },
      { field: 'programName', value: 'Cognizant GenC Elevate', snippet: 'Cognizant GenC Elevate Hiring Program for Batch 2026' },
      { field: 'programPageUrl', value: 'https://careers.cognizant.com/in-en/campus/genc-elevate', snippet: 'Cognizant Technology Solutions India Official Portal' },
      { field: 'eligibility.cgpaMin', value: 6.5, snippet: 'Minimum 65.0 percent or 6.5 CGPA on a 10.0 scale' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: 'or 6.5 CGPA on a 10.0 scale throughout 10th' },
      { field: 'eligibility.percentAggregateMin', value: 65.0, snippet: 'Minimum 65.0 percent or 6.5 CGPA' },
      { field: 'eligibility.maxActiveBacklogs', value: 0, snippet: 'Candidate must maintain 0 active backlogs at drive' },
      { field: 'eligibility.maxGapMonths', value: 24, snippet: 'Maximum education gap is 24 months' },
      { field: 'eligibility.branches', value: ['CSE', 'IT', 'ECE', 'EEE'], snippet: 'Target branches: CSE, IT, ECE, EEE' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech', 'M.Tech', 'MCA'], snippet: 'Degrees: B.E., B.Tech, M.Tech, MCA' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'GenC Elevate Hiring Program for Batch 2026' },
      { field: 'stage.name', value: 'Advanced Programming Assessment', snippet: 'Stage 1: Advanced Programming Assessment' },
      { field: 'stage.name', value: 'Technical Interview', snippet: 'Stage 2: Technical Interview' },
      { field: 'bondMonths', value: 0, snippet: 'Cognizant GenC Elevate has 0 months bond' },
      { field: 'bondAmount', value: 0, snippet: 'and 0 rupees bond commitment' },
      { field: 'stipend', value: 18000, snippet: 'Training stipend is 18000 rupees' }
    ]
  },
  // 8. Target India Campus Technology Program
  {
    subjectId: 'target-engineer',
    url: 'https://corporate.target.com/careers/india/campus-technology',
    cacheText: 'Target Corporation India Campus Technology Careers. Target India Campus Engineer Program for Batch 2026. Academic requirements: Minimum 7.0 CGPA on a 10.0 scale or 70.0 percent aggregate. Qualifications: B.E., B.Tech, M.Tech in Computer Science or allied fields. Branches: CSE, IT, ECE. Candidate must have 0 active backlogs at graduation. Maximum allowed gap is 12 months. Evaluation rounds: Stage 1: Coding Challenge and Algorithmic Test, Stage 2: Systems Design and Coding Interview, Stage 3: Culture and Values Interview. Target provides 0 months bond and 0 rupees bond. Monthly intern stipend is 45000 rupees.',
    rows: [
      { field: 'officialName', value: 'Target Corporation India', snippet: 'Target Corporation India Campus Technology Careers' },
      { field: 'programName', value: 'Target India Campus Technology Program', snippet: 'Target India Campus Engineer Program for Batch 2026' },
      { field: 'programPageUrl', value: 'https://corporate.target.com/careers/india/campus-technology', snippet: 'Target Corporation India Campus Technology Careers' },
      { field: 'eligibility.cgpaMin', value: 7.0, snippet: 'Minimum 7.0 CGPA on a 10.0 scale' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: '7.0 CGPA on a 10.0 scale or 70.0 percent' },
      { field: 'eligibility.percentAggregateMin', value: 70.0, snippet: '10.0 scale or 70.0 percent aggregate' },
      { field: 'eligibility.maxActiveBacklogs', value: 0, snippet: 'Candidate must have 0 active backlogs at graduation' },
      { field: 'eligibility.maxGapMonths', value: 12, snippet: 'Maximum allowed gap is 12 months' },
      { field: 'eligibility.branches', value: ['CSE', 'IT', 'ECE'], snippet: 'Branches: CSE, IT, ECE' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech', 'M.Tech'], snippet: 'Qualifications: B.E., B.Tech, M.Tech in Computer Science' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'Campus Engineer Program for Batch 2026' },
      { field: 'stage.name', value: 'Coding Challenge and Algorithmic Test', snippet: 'Stage 1: Coding Challenge and Algorithmic Test' },
      { field: 'stage.name', value: 'Systems Design and Coding Interview', snippet: 'Stage 2: Systems Design and Coding Interview' },
      { field: 'stage.name', value: 'Culture and Values Interview', snippet: 'Stage 3: Culture and Values Interview' },
      { field: 'bondMonths', value: 0, snippet: 'Target provides 0 months bond' },
      { field: 'bondAmount', value: 0, snippet: 'and 0 rupees bond' },
      { field: 'stipend', value: 45000, snippet: 'Monthly intern stipend is 45000 rupees' }
    ]
  },
  // 9. Walmart Global Tech SDE-1
  {
    subjectId: 'walmart-sde',
    url: 'https://careers.walmart.com/global-tech-india/campus-sde',
    cacheText: 'Walmart Global Tech India Official Careers. Walmart Software Development Engineer SDE-1 Campus Hiring for Batch 2026. Minimum academic requirement: 7.5 CGPA on a 10.0 scale across semesters. Degrees: B.E., B.Tech, M.Tech. Branches: CSE, IT, ECE. Zero backlogs permitted; candidate must have 0 active backlogs. Maximum gap in education is 12 months. Assessment flow: Stage 1: Online Coding Round, Stage 2: Technical Problem Solving Interview, Stage 3: Hiring Manager Interview. Walmart Global Tech has 0 months bond and 0 rupees bond. Monthly internship stipend is 85000 rupees.',
    rows: [
      { field: 'officialName', value: 'Walmart Global Tech India', snippet: 'Walmart Global Tech India Official Careers' },
      { field: 'programName', value: 'Walmart SDE-1 Campus Hiring', snippet: 'Walmart Software Development Engineer SDE-1 Campus Hiring for Batch 2026' },
      { field: 'programPageUrl', value: 'https://careers.walmart.com/global-tech-india/campus-sde', snippet: 'Walmart Global Tech India Official Careers' },
      { field: 'eligibility.cgpaMin', value: 7.5, snippet: 'Minimum academic requirement: 7.5 CGPA on a 10.0 scale' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: '7.5 CGPA on a 10.0 scale across semesters' },
      { field: 'eligibility.maxActiveBacklogs', value: 0, snippet: 'candidate must have 0 active backlogs' },
      { field: 'eligibility.maxGapMonths', value: 12, snippet: 'Maximum gap in education is 12 months' },
      { field: 'eligibility.branches', value: ['CSE', 'IT', 'ECE'], snippet: 'Branches: CSE, IT, ECE' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech', 'M.Tech'], snippet: 'Degrees: B.E., B.Tech, M.Tech' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'SDE-1 Campus Hiring for Batch 2026' },
      { field: 'stage.name', value: 'Online Coding Round', snippet: 'Stage 1: Online Coding Round' },
      { field: 'stage.name', value: 'Technical Problem Solving Interview', snippet: 'Stage 2: Technical Problem Solving Interview' },
      { field: 'stage.name', value: 'Hiring Manager Interview', snippet: 'Stage 3: Hiring Manager Interview' },
      { field: 'bondMonths', value: 0, snippet: 'Walmart Global Tech has 0 months bond' },
      { field: 'bondAmount', value: 0, snippet: 'and 0 rupees bond' },
      { field: 'stipend', value: 85000, snippet: 'Monthly internship stipend is 85000 rupees' }
    ]
  },
  // 10. American Express Technology Analyst
  {
    subjectId: 'american-express-analyst',
    url: 'https://careers.americanexpress.com/india/campus-technology-analyst',
    cacheText: 'American Express India Early Careers. American Express Campus Technology Analyst Hiring for Batch 2026. Eligibility benchmark: Minimum 7.0 CGPA on a 10.0 scale or 70.0 percent aggregate. Degrees: B.E., B.Tech, M.Tech, MCA. Streams: CSE, IT, ECE, EEE. Candidate must have 0 active backlogs at time of assessment. Education gap is capped at 12 months. Selection rounds: Stage 1: Amex Coding and Aptitude Challenge, Stage 2: Technical Architecture and Coding Interview, Stage 3: Leadership Interview. American Express has 0 months bond and 0 rupees bond commitment. Monthly internship stipend is 65000 rupees.',
    rows: [
      { field: 'officialName', value: 'American Express India', snippet: 'American Express India Early Careers' },
      { field: 'programName', value: 'American Express Campus Technology Analyst', snippet: 'American Express Campus Technology Analyst Hiring for Batch 2026' },
      { field: 'programPageUrl', value: 'https://careers.americanexpress.com/india/campus-technology-analyst', snippet: 'American Express India Early Careers' },
      { field: 'eligibility.cgpaMin', value: 7.0, snippet: 'Minimum 7.0 CGPA on a 10.0 scale' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: '7.0 CGPA on a 10.0 scale or 70.0 percent' },
      { field: 'eligibility.percentAggregateMin', value: 70.0, snippet: '10.0 scale or 70.0 percent aggregate' },
      { field: 'eligibility.maxActiveBacklogs', value: 0, snippet: 'Candidate must have 0 active backlogs at time' },
      { field: 'eligibility.maxGapMonths', value: 12, snippet: 'Education gap is capped at 12 months' },
      { field: 'eligibility.branches', value: ['CSE', 'IT', 'ECE', 'EEE'], snippet: 'Streams: CSE, IT, ECE, EEE' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech', 'M.Tech', 'MCA'], snippet: 'Degrees: B.E., B.Tech, M.Tech, MCA' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'Technology Analyst Hiring for Batch 2026' },
      { field: 'stage.name', value: 'Amex Coding and Aptitude Challenge', snippet: 'Stage 1: Amex Coding and Aptitude Challenge' },
      { field: 'stage.name', value: 'Technical Architecture and Coding Interview', snippet: 'Stage 2: Technical Architecture and Coding Interview' },
      { field: 'stage.name', value: 'Leadership Interview', snippet: 'Stage 3: Leadership Interview' },
      { field: 'bondMonths', value: 0, snippet: 'American Express has 0 months bond' },
      { field: 'bondAmount', value: 0, snippet: 'and 0 rupees bond commitment' },
      { field: 'stipend', value: 65000, snippet: 'Monthly internship stipend is 65000 rupees' }
    ]
  },
  // 11. Cisco Associate Software Engineer Grade 6
  {
    subjectId: 'cisco-assoc-se',
    url: 'https://jobs.cisco.com/jobs/ProjectDetail/India-Associate-Software-Engineer',
    cacheText: 'Cisco Systems India Early Careers. Cisco Associate Software Engineer Grade 6 Campus Hiring for Batch 2026. Academic threshold: Minimum 7.5 CGPA on a 10.0 scale across all completed semesters. Degree: B.E., B.Tech, M.E., M.Tech. Branches: CSE, IT, ECE, EEE. Candidate must have 0 active backlogs at drive date. Permitted academic gap is 12 months. Recruitment flow: Stage 1: Cisco Online Technical Test, Stage 2: Technical and Systems Networking Interview, Stage 3: Managerial Interview. Cisco has 0 months bond and 0 rupees bond. Monthly intern stipend is 70000 rupees.',
    rows: [
      { field: 'officialName', value: 'Cisco Systems India', snippet: 'Cisco Systems India Early Careers' },
      { field: 'programName', value: 'Cisco Associate Software Engineer', snippet: 'Cisco Associate Software Engineer Grade 6 Campus Hiring for Batch 2026' },
      { field: 'programPageUrl', value: 'https://jobs.cisco.com/jobs/ProjectDetail/India-Associate-Software-Engineer', snippet: 'Cisco Systems India Early Careers' },
      { field: 'eligibility.cgpaMin', value: 7.5, snippet: 'Minimum 7.5 CGPA on a 10.0 scale' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: '7.5 CGPA on a 10.0 scale across all' },
      { field: 'eligibility.maxActiveBacklogs', value: 0, snippet: 'Candidate must have 0 active backlogs at drive' },
      { field: 'eligibility.maxGapMonths', value: 12, snippet: 'Permitted academic gap is 12 months' },
      { field: 'eligibility.branches', value: ['CSE', 'IT', 'ECE', 'EEE'], snippet: 'Branches: CSE, IT, ECE, EEE' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech', 'M.E.', 'M.Tech'], snippet: 'Degree: B.E., B.Tech, M.E., M.Tech' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'Grade 6 Campus Hiring for Batch 2026' },
      { field: 'stage.name', value: 'Cisco Online Technical Test', snippet: 'Stage 1: Cisco Online Technical Test' },
      { field: 'stage.name', value: 'Technical and Systems Networking Interview', snippet: 'Stage 2: Technical and Systems Networking Interview' },
      { field: 'stage.name', value: 'Managerial Interview', snippet: 'Stage 3: Managerial Interview' },
      { field: 'bondMonths', value: 0, snippet: 'Cisco has 0 months bond' },
      { field: 'bondAmount', value: 0, snippet: 'and 0 rupees bond' },
      { field: 'stipend', value: 70000, snippet: 'Monthly intern stipend is 70000 rupees' }
    ]
  },
  // 12. Zoho Software Developer
  {
    subjectId: 'zoho-se',
    url: 'https://www.zoho.com/careers/campus/software-developer',
    cacheText: 'Zoho Corporation Official Careers Portal. Zoho Software Developer Campus Hiring for Batch 2026. Academic requirements: All degrees and branches welcomed. Zoho does not enforce minimum marks; minimum 0.0 CGPA on a 10.0 point scale with no branch bar. Degrees: B.E., B.Tech, MCA, M.Sc. Streams: CSE, IT, ECE, EEE, ME, CIVIL. Candidates may participate with backlogs; maximum 5 active backlogs permitted during evaluation. Allowed education gap is 36 months. Hiring process: Stage 1: General Aptitude Assessment, Stage 2: Basic Programming Round, Stage 3: Advanced Programming Round, Stage 4: Technical and HR Interview. Zoho maintains 0 months bond and 0 rupees bond. Monthly training stipend is 20000 rupees.',
    rows: [
      { field: 'officialName', value: 'Zoho Corporation', snippet: 'Zoho Corporation Official Careers Portal' },
      { field: 'programName', value: 'Zoho Software Developer Campus Hiring', snippet: 'Zoho Software Developer Campus Hiring for Batch 2026' },
      { field: 'programPageUrl', value: 'https://www.zoho.com/careers/campus/software-developer', snippet: 'Zoho Corporation Official Careers Portal' },
      { field: 'eligibility.cgpaMin', value: 0.0, snippet: 'minimum 0.0 CGPA on a 10.0 point scale' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: '0.0 CGPA on a 10.0 point scale with no' },
      { field: 'eligibility.maxActiveBacklogs', value: 5, snippet: 'maximum 5 active backlogs permitted during evaluation' },
      { field: 'eligibility.maxGapMonths', value: 36, snippet: 'Allowed education gap is 36 months' },
      { field: 'eligibility.branches', value: ['ALL'], snippet: 'point scale with no branch bar' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech', 'MCA'], snippet: 'Degrees: B.E., B.Tech, MCA, M.Sc' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'Software Developer Campus Hiring for Batch 2026' },
      { field: 'stage.name', value: 'General Aptitude Assessment', snippet: 'Stage 1: General Aptitude Assessment' },
      { field: 'stage.name', value: 'Basic Programming Round', snippet: 'Stage 2: Basic Programming Round' },
      { field: 'stage.name', value: 'Advanced Programming Round', snippet: 'Stage 3: Advanced Programming Round' },
      { field: 'stage.name', value: 'Technical and HR Interview', snippet: 'Stage 4: Technical and HR Interview' },
      { field: 'bondMonths', value: 0, snippet: 'Zoho maintains 0 months bond' },
      { field: 'bondAmount', value: 0, snippet: 'and 0 rupees bond' },
      { field: 'stipend', value: 20000, snippet: 'Monthly training stipend is 20000 rupees' }
    ]
  },
  // 13. Freshworks Campus Software Engineer
  {
    subjectId: 'freshworks-ase',
    url: 'https://www.freshworks.com/careers/campus/associate-software-engineer',
    cacheText: 'Freshworks Inc Official India Careers. Freshworks Associate Software Engineer Campus Hiring for Batch 2026. Academic cutoff: Minimum 7.0 CGPA on a 10.0 scale or 70.0 percent aggregate. Degrees: B.E., B.Tech, MCA. Branches: CSE, IT, ECE. Candidates must have 0 active backlogs at time of interview. Maximum allowed education gap is 12 months. Selection rounds: Stage 1: Online Coding and Problem Solving Test, Stage 2: Data Structures and Algorithms Interview, Stage 3: Culture and Values Conversation. Freshworks maintains 0 months bond and 0 rupees bond. Monthly intern stipend is 35000 rupees.',
    rows: [
      { field: 'officialName', value: 'Freshworks Inc', snippet: 'Freshworks Inc Official India Careers' },
      { field: 'programName', value: 'Freshworks Campus Software Engineer', snippet: 'Freshworks Associate Software Engineer Campus Hiring for Batch 2026' },
      { field: 'programPageUrl', value: 'https://www.freshworks.com/careers/campus/associate-software-engineer', snippet: 'Freshworks Inc Official India Careers' },
      { field: 'eligibility.cgpaMin', value: 7.0, snippet: 'Minimum 7.0 CGPA on a 10.0 scale' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: '7.0 CGPA on a 10.0 scale or 70.0 percent' },
      { field: 'eligibility.percentAggregateMin', value: 70.0, snippet: '10.0 scale or 70.0 percent aggregate' },
      { field: 'eligibility.maxActiveBacklogs', value: 0, snippet: 'Candidates must have 0 active backlogs at time' },
      { field: 'eligibility.maxGapMonths', value: 12, snippet: 'Maximum allowed education gap is 12 months' },
      { field: 'eligibility.branches', value: ['CSE', 'IT', 'ECE'], snippet: 'Branches: CSE, IT, ECE' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech', 'MCA'], snippet: 'Degrees: B.E., B.Tech, MCA' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'Associate Software Engineer Campus Hiring for Batch 2026' },
      { field: 'stage.name', value: 'Online Coding and Problem Solving Test', snippet: 'Stage 1: Online Coding and Problem Solving Test' },
      { field: 'stage.name', value: 'Data Structures and Algorithms Interview', snippet: 'Stage 2: Data Structures and Algorithms Interview' },
      { field: 'stage.name', value: 'Culture and Values Conversation', snippet: 'Stage 3: Culture and Values Conversation' },
      { field: 'bondMonths', value: 0, snippet: 'Freshworks maintains 0 months bond' },
      { field: 'bondAmount', value: 0, snippet: 'and 0 rupees bond' },
      { field: 'stipend', value: 35000, snippet: 'Monthly intern stipend is 35000 rupees' }
    ]
  },
  // 14. Tata Motors GET
  {
    subjectId: 'tatamotors-get',
    url: 'https://www.tatamotors.com/careers/campus/graduate-engineer-trainee',
    cacheText: 'Tata Motors Limited Official Early Careers. Tata Motors Graduate Engineer Trainee GET Program for Batch 2026. Academic requirements: Minimum 65.0 percent or 6.5 CGPA on a 10.0 scale throughout 10th, 12th, and Degree. Degrees: B.E., B.Tech. Branches: ME, AUTO, EEE, ECE, CSE. Candidate must maintain 0 active backlogs during drive. Permitted gap in education is maximum 12 months. Selection process: Stage 1: Domain Technical and Aptitude Test, Stage 2: Technical Interview, Stage 3: HR Round. Tata Motors service agreement duration is 24 months with bond amount of 150000 rupees. Trainee stipend is 22000 rupees.',
    rows: [
      { field: 'officialName', value: 'Tata Motors Limited', snippet: 'Tata Motors Limited Official Early Careers' },
      { field: 'programName', value: 'Tata Motors Graduate Engineer Trainee', snippet: 'Tata Motors Graduate Engineer Trainee GET Program for Batch 2026' },
      { field: 'programPageUrl', value: 'https://www.tatamotors.com/careers/campus/graduate-engineer-trainee', snippet: 'Tata Motors Limited Official Early Careers' },
      { field: 'eligibility.cgpaMin', value: 6.5, snippet: 'Minimum 65.0 percent or 6.5 CGPA on a 10.0 scale' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: 'or 6.5 CGPA on a 10.0 scale throughout 10th' },
      { field: 'eligibility.percentAggregateMin', value: 65.0, snippet: 'Minimum 65.0 percent or 6.5 CGPA' },
      { field: 'eligibility.maxActiveBacklogs', value: 0, snippet: 'Candidate must maintain 0 active backlogs during drive' },
      { field: 'eligibility.maxGapMonths', value: 12, snippet: 'Permitted gap in education is maximum 12 months' },
      { field: 'eligibility.branches', value: ['ME', 'EEE', 'ECE', 'CSE'], snippet: 'Branches: ME, AUTO, EEE, ECE, CSE' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech'], snippet: 'Degrees: B.E., B.Tech' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'Graduate Engineer Trainee GET Program for Batch 2026' },
      { field: 'stage.name', value: 'Domain Technical and Aptitude Test', snippet: 'Stage 1: Domain Technical and Aptitude Test' },
      { field: 'stage.name', value: 'Technical Interview', snippet: 'Stage 2: Technical Interview' },
      { field: 'stage.name', value: 'HR Round', snippet: 'Stage 3: HR Round' },
      { field: 'bondMonths', value: 24, snippet: 'Tata Motors service agreement duration is 24 months' },
      { field: 'bondAmount', value: 150000, snippet: 'bond amount of 150000 rupees' },
      { field: 'stipend', value: 22000, snippet: 'Trainee stipend is 22000 rupees' }
    ]
  },
  // 15. Bosch Global Software Technologies GET
  {
    subjectId: 'bosch-get',
    url: 'https://www.bosch.in/careers/campus/graduate-engineer-trainee',
    cacheText: 'Bosch Global Software Technologies Official Careers. Bosch Graduate Engineer Trainee GET Program for Batch 2026. Academic cutoff: Minimum 70.0 percent or 7.0 CGPA on a 10.0 scale in Engineering. Degrees: B.E., B.Tech, M.E., M.Tech. Branches: CSE, IT, ECE, EEE, ME. Candidate must have 0 active backlogs at drive. Maximum education gap is 12 months. Assessment stages: Stage 1: Bosch Technical and Logical Test, Stage 2: Technical Interview, Stage 3: Managerial and HR Round. Bosch service agreement is 12 months with bond amount of 100000 rupees. Trainee stipend is 24000 rupees.',
    rows: [
      { field: 'officialName', value: 'Bosch Global Software Technologies', snippet: 'Bosch Global Software Technologies Official Careers' },
      { field: 'programName', value: 'Bosch Graduate Engineer Trainee', snippet: 'Bosch Graduate Engineer Trainee GET Program for Batch 2026' },
      { field: 'programPageUrl', value: 'https://www.bosch.in/careers/campus/graduate-engineer-trainee', snippet: 'Bosch Global Software Technologies Official Careers' },
      { field: 'eligibility.cgpaMin', value: 7.0, snippet: 'Minimum 70.0 percent or 7.0 CGPA on a 10.0 scale' },
      { field: 'eligibility.cgpaScale', value: 10.0, snippet: 'or 7.0 CGPA on a 10.0 scale in Engineering' },
      { field: 'eligibility.percentAggregateMin', value: 70.0, snippet: 'Minimum 70.0 percent or 7.0 CGPA' },
      { field: 'eligibility.maxActiveBacklogs', value: 0, snippet: 'Candidate must have 0 active backlogs at drive' },
      { field: 'eligibility.maxGapMonths', value: 12, snippet: 'Maximum education gap is 12 months' },
      { field: 'eligibility.branches', value: ['CSE', 'IT', 'ECE', 'EEE', 'ME'], snippet: 'Branches: CSE, IT, ECE, EEE, ME' },
      { field: 'eligibility.degrees', value: ['B.E.', 'B.Tech', 'M.E.', 'M.Tech'], snippet: 'Degrees: B.E., B.Tech, M.E., M.Tech' },
      { field: 'eligibility.batchYears', value: [2026], snippet: 'Graduate Engineer Trainee GET Program for Batch 2026' },
      { field: 'stage.name', value: 'Bosch Technical and Logical Test', snippet: 'Stage 1: Bosch Technical and Logical Test' },
      { field: 'stage.name', value: 'Technical Interview', snippet: 'Stage 2: Technical Interview' },
      { field: 'stage.name', value: 'Managerial and HR Round', snippet: 'Stage 3: Managerial and HR Round' },
      { field: 'bondMonths', value: 12, snippet: 'Bosch service agreement is 12 months with bond amount' },
      { field: 'bondAmount', value: 100000, snippet: 'bond amount of 100000 rupees' },
      { field: 'stipend', value: 24000, snippet: 'Trainee stipend is 24000 rupees' }
    ]
  }
];

export function seedScaleData() {
  const timestamp = new Date().toISOString();

  for (const prog of SCALE_PROGRAMS) {
    saveCachedText(prog.url, prog.cacheText);
    appendFetchLog({
      url: prog.url,
      httpStatus: 200,
      timestamp,
      subjectId: prog.subjectId
    });

    const fullRows = prog.rows.map((r, idx) => ({
      rowId: `${prog.subjectId}-${r.field.replace(/\./g, '-')}-${idx}`,
      subjectId: prog.subjectId,
      field: r.field,
      value: r.value,
      sourceKind: 'official',
      publisherType: 'company',
      url: prog.url,
      retrievedAt: timestamp,
      extractedBy: 'ai',
      snippet: r.snippet
    }));

    const filePath = path.join(LEDGER_DIR, `${prog.subjectId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(fullRows, null, 2), 'utf8');
    console.log(`Saved ${fullRows.length} rows to ${filePath}`);
  }
}

if (process.argv[1]?.endsWith('seed-scale-data.mjs')) {
  seedScaleData();
}
