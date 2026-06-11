import axios from "axios";
import type { TreeData } from '../types/tree.types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const treeApi = {
  saveTree: async (data: TreeData) => {
    const response = await apiClient.post('/trees/', data);
    return response.data;
  },
  getTree: async (id: string) => {
    const response = await apiClient.get(`/trees/${id}`);
    return response.data;
  },
};