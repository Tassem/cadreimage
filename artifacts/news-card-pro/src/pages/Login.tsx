import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { mutate: login, isPending } = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    login(
      { data: values },
      {
        onSuccess: (data: any) => {
          localStorage.setItem("pro_token", data.token);
          setLocation("/dashboard");
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "مرحباً بك في NewsCard Pro",
          });
        },
        onError: (error: any) => {
          toast({
            title: "خطأ في تسجيل الدخول",
            description: error?.data?.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-primary/10 w-12 h-12 flex items-center justify-center rounded-lg mb-2">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">تسجيل الدخول</CardTitle>
          <CardDescription className="text-sm">
            مرحباً بك مجدداً في NewsCard Pro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label>البريد الإلكتروني</Label>
                    <FormControl>
                      <Input placeholder="name@example.com" type="email" disabled={isPending} {...field} dir="ltr" className="text-right" />
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
                    <div className="flex items-center justify-between">
                      <Label>كلمة المرور</Label>
                    </div>
                    <FormControl>
                      <Input type="password" disabled={isPending} {...field} dir="ltr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4 border-t">
          <div className="text-sm text-center text-muted-foreground w-full">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              سجل الآن
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
