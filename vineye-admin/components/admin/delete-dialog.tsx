"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeleteDialogProps {
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
}

export default function DeleteDialog({ title, description, onConfirm }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-8 w-8 text-stone-600 hover:text-[#FB7185] hover:bg-wine/10"
        )}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </AlertDialogTrigger>
      <AlertDialogContent className="border-[oklch(0.22_0.006_60)] bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-semibold text-cream">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-stone-400">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            className="rounded-xl bg-[oklch(0.18_0.005_60)] border-[oklch(0.25_0.006_60)] text-cream hover:bg-[oklch(0.22_0.005_60)]"
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-xl bg-wine hover:bg-wine/90 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
