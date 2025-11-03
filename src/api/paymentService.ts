import axiosClient from "./axiosClient.js";

export const initiatePayment = async (amount: number) => {
  const { data } = await axiosClient.post("/payment/initiate", { amount });
  return data;
};
