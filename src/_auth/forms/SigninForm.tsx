import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signinSchema } from "@/lib/Validation";
import { useSignInAccount } from "@/lib/react-query/QueriesAndMutation";
import { useUserContext } from "@/Context/useAuthContext";

// ✅ بيانات الـ demo account
const DEMO_EMAIL = "demo@snapgram.com";
const DEMO_PASSWORD = "demo123456";

const SigninForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuthUser } = useUserContext();
  const [showPassword, setShowPassword] = useState(false);

  const { mutateAsync: signInAccount, isPending: isSigningIn } = useSignInAccount();

  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: location.state?.email || "",
      password: location.state?.password || "",
    },
  });

  useEffect(() => {
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const onSubmit = async (values: z.infer<typeof signinSchema>) => {
    try {
      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });

      if (!session) throw new Error("Failed to create session");

      await new Promise((resolve) => setTimeout(resolve, 500));

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        toast.success("Welcome back!");
        navigate("/");
      } else {
        toast.error("Authentication failed");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Failed to log in");
    }
  };

  
  const handleDemoLogin = () => {
    form.setValue("email", DEMO_EMAIL);
    form.setValue("password", DEMO_PASSWORD);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-107.5 text-white">
      <img src="/assets/images/logo.svg" alt="logo" className="h-12 mb-5" />

      <h2 className="text-3xl font-bold pt-5">Log in to your account</h2>
      <p className="text-gray-400 mt-2">Welcome back!</p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 w-full mt-8"
        >
          {/* EMAIL */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    className="bg-[#1F1F22] border-none text-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PASSWORD */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="bg-[#1F1F22] border-none text-white pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white w-full"
            disabled={isSigningIn}
          >
            {isSigningIn ? "Loading..." : "Log in"}
          </Button>

          {/*  Demo Account Button */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-dark-4" />
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-dark-4" />
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSigningIn}
            className="w-full py-2.5 rounded-lg border border-purple-500 text-purple-400 hover:bg-purple-500/10 transition text-sm font-medium disabled:opacity-50"
          >
             Try Demo Account
          </button>

          <p className="text-center mt-2 text-gray-400">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-purple-500 font-semibold underline">
              Sign up
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
};

export default SigninForm;