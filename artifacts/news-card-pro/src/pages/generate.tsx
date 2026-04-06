import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useGenerateImage, useListTemplates, getListTemplatesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Wand2, RefreshCw } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  label: z.string().optional(),
  templateId: z.string().optional(),
  aspectRatio: z.string().default("1:1"),
});

export default function Generate() {
  const { token } = useAuth();
  const { toast } = useToast();
  const generate = useGenerateImage();
  const [resultImage, setResultImage] = useState<string | null>(null);

  const { data: templates } = useListTemplates({
    query: { enabled: !!token, queryKey: getListTemplatesQueryKey() }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      label: "",
      templateId: "none",
      aspectRatio: "1:1",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setResultImage(null);
    const payload = {
      ...values,
      templateId: values.templateId !== "none" ? values.templateId : undefined,
    };

    generate.mutate({ data: payload }, {
      onSuccess: (data) => {
        setResultImage(data.imageUrl);
        toast({
          title: "Success",
          description: "Image generated successfully.",
        });
      },
      onError: (error) => {
        toast({
          title: "Generation failed",
          description: error.message || "An error occurred",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Card</h1>
        <p className="text-muted-foreground mt-2">Create a new Arabic news card instantly.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>Enter the details for your news card</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Headline (Arabic)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="أدخل العنوان الرئيسي هنا" 
                          dir="rtl"
                          className="min-h-[100px] resize-none font-sans" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="أدخل النص الفرعي هنا" 
                          dir="rtl"
                          className="min-h-[60px] resize-none font-sans text-sm" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Label / Tag</FormLabel>
                        <FormControl>
                          <Input placeholder="عاجل" dir="rtl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aspectRatio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1:1">Square (1:1) - Instagram</SelectItem>
                            <SelectItem value="16:9">Landscape (16:9) - Twitter/Web</SelectItem>
                            <SelectItem value="9:16">Portrait (9:16) - Stories/Reels</SelectItem>
                            <SelectItem value="4:5">Portrait (4:5) - Feed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Default Style</SelectItem>
                          {templates?.map((t) => (
                            <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Choose a pre-configured style</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full mt-6" disabled={generate.isPending}>
                  {generate.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Wand2 className="mr-2 h-4 w-4" /> Generate Card</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>Your generated image will appear here</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center min-h-[400px] p-6">
            {generate.isPending ? (
              <div className="flex flex-col items-center text-muted-foreground animate-pulse">
                <RefreshCw className="h-8 w-8 animate-spin mb-4 text-primary" />
                <p>Rendering graphics...</p>
              </div>
            ) : resultImage ? (
              <div className="w-full flex flex-col items-center">
                <div className="relative w-full rounded-lg overflow-hidden border border-border/50 shadow-lg group">
                  <img src={resultImage} alt="Generated card" className="w-full h-auto object-contain" />
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
                  <Wand2 className="h-8 w-8 opacity-50" />
                </div>
                <p>Fill out the form and generate to see results.</p>
              </div>
            )}
          </CardContent>
          {resultImage && (
            <CardFooter className="bg-secondary/20 pt-4">
              <Button className="w-full" asChild>
                <a href={resultImage} download target="_blank" rel="noreferrer">
                  <Download className="mr-2 h-4 w-4" /> Download High-Res Image
                </a>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}