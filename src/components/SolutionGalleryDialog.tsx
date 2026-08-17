import { Link } from "react-router-dom";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import OptimizedImage from "@/components/OptimizedImage";
import type { SolutionImage } from "@/assets/solutions";

interface SolutionGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  caption: string;
  alt: string;
  image: SolutionImage;
}

/**
 * Click-to-open lightbox for a Solutions card. Shows the hero image at full size,
 * a short caption, and a CTA to the contact / quote flow.
 */
export default function SolutionGalleryDialog({
  open,
  onOpenChange,
  title,
  caption,
  alt,
  image,
}: SolutionGalleryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border/40">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{caption}</DialogDescription>

        <div className="relative">
          <OptimizedImage
            src={image.src}
            webpSources={image.webp}
            blurDataURI={image.blur}
            alt={alt}
            sizes="(min-width: 768px) 768px, 100vw"
            width={1440}
            height={900}
            loading="eager"
            className="aspect-[16/10] w-full bg-muted"
          />
          <DialogClose
            aria-label="Close gallery"
            className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-md text-foreground hover:bg-background transition-colors"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </div>

        <div className="p-5 sm:p-6 md:p-8">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
            {title}
          </h3>
          <p className="font-body text-muted-foreground text-sm sm:text-base leading-relaxed mb-5">
            {caption}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/contact"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center bg-accent text-accent-foreground px-6 py-3 rounded-full font-body text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Request a Quote
            </Link>
            <Link
              to="/products"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center border border-border/50 text-foreground px-6 py-3 rounded-full font-body text-sm font-medium hover:bg-muted transition-colors"
            >
              View Products
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
