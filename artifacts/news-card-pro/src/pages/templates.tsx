import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  useListTemplates, 
  getListTemplatesQueryKey, 
  useCreateTemplate, 
  useDeleteTemplate 
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LayoutTemplate, Plus, Trash2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  aspectRatio: z.string().default("1:1"),
  bannerColor: z.string().default("#ef4444"),
  textColor: z.string().default("#ffffff"),
  font: z.string().default("tajawal"),
  fontSize: z.coerce.number().default(48),
  logoPos: z.string().default("top-right"),
  isPublic: z.boolean().default(false),
});

export default function Templates() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: templates, isLoading } = useListTemplates({
    query: { enabled: !!token, queryKey: getListTemplatesQueryKey() }
  });

  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      aspectRatio: "1:1",
      bannerColor: "#ef4444",
      textColor: "#ffffff",
      font: "tajawal",
      fontSize: 48,
      logoPos: "top-right",
      isPublic: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createTemplate.mutate({ data: {
      ...values,
      elements: "[]",
      category: "general",
      fontWeight: 700,
      photoHeight: 50,
      logoInvert: false,
      textShadow: true,
      labelColor: "#ffffff"
    }}, {
      onSuccess: () => {
        toast({ title: "Template created" });
        queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
        setOpen(false);
        form.reset();
      },
      onError: (err) => {
        toast({ title: "Error creating template", description: err.message, variant: "destructive" });
      }
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    deleteTemplate.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Template deleted" });
        queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Error deleting template", description: err.message, variant: "destructive" });
      }
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground mt-2">Manage your reusable design configurations.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
              <DialogDescription>Define a new style preset for generating cards.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Breaking News Style" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bannerColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Color</FormLabel>
                        <FormControl><Input type="color" className="h-10 px-1 py-1 w-full" {...field} /></FormControl>
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
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1:1">1:1 Square</SelectItem>
                            <SelectItem value="16:9">16:9 Wide</SelectItem>
                            <SelectItem value="9:16">9:16 Tall</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createTemplate.isPending}>
                    {createTemplate.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Template
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1,2,3].map(i => (
            <Card key={i} className="bg-card/50 border-border/50"><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : templates?.length === 0 ? (
        <div className="text-center py-16 bg-card/30 rounded-xl border border-dashed border-border/50">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
            <LayoutTemplate className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium">No templates yet</h3>
          <p className="text-muted-foreground mt-2 mb-6">Create your first template to speed up your workflow.</p>
          <Button onClick={() => setOpen(true)}>Create Template</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates?.map((t) => (
            <Card key={t.id} className="bg-card/50 border-border/50 group overflow-hidden hover:border-primary/50 transition-colors">
              <div className="h-2 w-full" style={{ backgroundColor: t.bannerColor }} />
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t.name}</CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <span>{t.aspectRatio}</span>
                  <span>•</span>
                  <span className="uppercase">{t.font}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex flex-wrap gap-2">
                  <div className="text-xs px-2 py-1 bg-secondary rounded flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.textColor }} /> Text
                  </div>
                  <div className="text-xs px-2 py-1 bg-secondary rounded">
                    Size: {t.fontSize}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(t.id)} disabled={deleteTemplate.isPending}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}