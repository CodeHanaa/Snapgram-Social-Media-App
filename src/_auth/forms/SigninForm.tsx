import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signinSchema } from "@/lib/Validation";

const SigninForm = () => {
  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof signinSchema>) => {
    console.log(values);
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-[420px] text-white">
      <h2 className="text-3xl font-bold pt-5">Log in to your account</h2>
      <p className="text-gray-400 mt-2">Welcome back! Please enter your details</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-8">
          
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" className="bg-[#1F1F22] border-none text-white" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" className="bg-[#1F1F22] border-none text-white" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white w-full">Log in</Button>

          <p className="text-center mt-2 text-gray-400">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-purple-500 font-semibold">Sign up</Link>
          </p>
        </form>
      </Form>
    </div>
  );
};

export default SigninForm;