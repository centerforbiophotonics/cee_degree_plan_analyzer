import axios from 'axios';
import { DegreePlan, Course } from './types/degreeplan.types';

const api = axios.create({
  baseURL: "http://localhost:8081/api",
  headers: {
    "Content-type": "application/json",
  }
});

export async function getAllDegreePlans() {
  return api.get<DegreePlan[]>("/degree_plans");
}

export async function getDegreePlanInfo(id: number | null) {
  return api.get<Course[]>("/degree_plan_info", {params: { id: id }});
}