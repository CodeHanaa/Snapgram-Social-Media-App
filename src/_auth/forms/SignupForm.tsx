import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().min(2, { message: "Too short" }),
  username: z.string().min(2, { message: "Too short" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Must be at least 6 characters" }),
});

const SignupForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", username: "", email: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-[420px] text-white">
      <h2 className="text-3xl font-bold pt-5">Create a new account</h2>
      <p className="text-gray-400 mt-2">To use snapgram, Please enter your details</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full mt-8">
          
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input className="bg-[#1F1F22] border-none text-white" placeholder="Name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="username" render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl><Input className="bg-[#1F1F22] border-none text-white" placeholder="Username" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input className="bg-[#1F1F22] border-none text-white" placeholder="Email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input type="password" className="bg-[#1F1F22] border-none text-white" placeholder="Password" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white w-full">Sign Up</Button>
      
          <p className="text-small-regular text-light-2 text-center mt-2">
            Already have an account?{" "}
            <a href="/sign-in" className="text-primary-500 text-small-semibold ml-1">
              Log in
            </a>
          </p>
        </form>
      </Form>
    </div>
  );
};

export default SignupForm;