import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppwriteException } from "appwrite";

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

import { signupSchema } from "@/lib/Validation";
import {
  useCreateUserAccount,
  useSignUpAccount,
} from "@/lib/react-query/QueriesAndMutation";

const SignupForm = () => {
  const navigate = useNavigate();

  const { mutateAsync: signUpAccount, isPending: isSigningUp } =
    useSignUpAccount();

  const { mutateAsync: createUserAccount, isPending: isCreatingUser } =
    useCreateUserAccount();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
        // 1. Create user account in Appwrite Auth
        const newAccount = await signUpAccount({
        email: values.email,
        password: values.password,
        name: values.name,
        userName: values.username,
      });

      if (!newAccount) {
        toast.error("Sign up failed. Please try again.");
        return;
      }

        // 2. Create user profile in Database
        const newUser = await createUserAccount({
        accountId: newAccount.$id,
        name: values.name,
        email: values.email,
        username: values.username,
        imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          values.name
        )}&background=random`,
        bio: "",
      });

      if (!newUser) {
        toast.error("Failed to save profile. Please try again.");
        return;
      }

      toast.success("Welcome to Snapgram! Account created successfully.");

      form.reset();

      navigate("/sign-in", {
        state: {
          email: values.email,
          password: values.password,
        },
      });
    } catch (error: unknown) {
      const err = error as AppwriteException;

      console.error("Signup error details:", err);

      if (err.code === 409) {
        toast.error("This email or username is already taken.");
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-105 text-white">
      <img src="/assets/images/logo.svg" alt="logo" className="h-12 mb-5" />

      <h2 className="text-3xl font-bold pt-5">Create a new account</h2>

      <p className="text-gray-400 mt-2">
        To use snapgram, please enter your details
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 w-full mt-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    className="bg-[#1F1F22] border-none text-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    className="bg-[#1F1F22] border-none text-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className="bg-[#1F1F22] border-none text-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white w-full"
            disabled={isCreatingUser || isSigningUp}
          >
            {isCreatingUser || isSigningUp ? "Loading..." : "Sign Up"}
          </Button>

          <p className="text-center mt-2 text-gray-400">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="text-purple-500 font-semibold underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
};

export default SignupForm;