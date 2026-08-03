import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center gap-4 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-olive">
        404
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
        We can&apos;t find this.
      </h1>
      <p className="max-w-sm text-sm text-warmgray">
        The product or store you&apos;re looking for may have been removed.
        Try searching for something else.
      </p>
      <div className="mt-2 flex gap-2">
        <Link href="/">
          <Button size="lg" variant="primary">
            Go home
          </Button>
        </Link>
        <Link href="/search">
          <Button size="lg" variant="outline">
            Search products
          </Button>
        </Link>
      </div>
    </div>
  );
}
