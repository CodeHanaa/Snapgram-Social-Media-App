import { useMutation } from "@tanstack/react-query";
import { createUserAccount, signOutAccount } from "../Appwrite/Api";
import type { INewUser } from "@/Types";
import { signUpAccount, signInAccount } from "@/lib/Appwrite/Api";


//  CREATE USER (DATABASE)
export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (userData: INewUser) => createUserAccount(userData),
  });
};


//  SIGN UP (AUTH)
export const useSignUpAccount = () => {
  return useMutation({
    mutationFn: (user: {
      email: string;
      password: string;
      name: string;
      userName: string;
    }) => signUpAccount(user),
  });
};


//  SIGN IN
export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: {
      email: string;
      password: string;
    }) => signInAccount(user),
  });
};

//  SIGN OUT
export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: () => signOutAccount(),
  });
};

