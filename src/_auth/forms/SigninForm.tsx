import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signinSchema } from "@/lib/Validation";
import { useSignInAccount } from "@/lib/react-query/QueriesAndMutation";
import { useUserContext } from "@/Context/useAuthContext";

const SigninForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuthUser } = useUserContext();
  const { mutateAsync: signInAccount, isPending: isSigningIn } = useSignInAccount();

  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: { 
      email: location.state?.email || "", 
      password: location.state?.password || "" 
    },
  });

  useEffect(() => {
    if (location.state) window.history.replaceState({}, document.title);
  }, [location]);

  const onSubmit = async (values: z.infer<typeof signinSchema>) => {
    try {
      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });

      if (!session) throw new Error("Failed to create session");

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        toast.success("Welcome back!");
        navigate("/");
      } else {
        toast.error("Auth check failed. Please log in again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-105 text-white">
      <img src="/assets/images/logo.svg" alt="logo" className="h-12 mb-5" />
      <h2 className="text-3xl font-bold pt-5">Log in to your account</h2>
      <p className="text-gray-400 mt-2">Welcome back!</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-8">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" className="bg-[#1F1F22] border-none text-white" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input type="password" className="bg-[#1F1F22] border-none text-white" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white w-full" disabled={isSigningIn}>
            {isSigningIn ? "Loading..." : "Log in"}
          </Button>
          <p className="text-center mt-2 text-gray-400">
            Don't have an account? <Link to="/sign-up" className="text-purple-500 font-semibold underline">Sign up</Link>
          </p>
        </form>
      </Form>
    </div>
  );
};

export default SigninForm;