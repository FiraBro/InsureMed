import { useMutation } from "@tanstack/react-query";
import axios from "@/lib/axios";

export const useCreatePlan = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axios.post("/plans", payload);
      return data;
    },
  });
};
