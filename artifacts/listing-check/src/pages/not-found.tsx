import { Link } from "wouter";
import { Shell, Eyebrow, btnInk } from "@/components/bits";

export default function NotFound() {
  return (
    <Shell>
      <div className="py-16 text-center">
        <Eyebrow>Error 404</Eyebrow>
        <p className="font-display mt-3 text-[96px] font-extrabold leading-none text-primary">404</p>
        <h1 className="font-display mt-2 text-2xl font-bold">Nothing on this bench</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page you were looking for is not here.</p>
        <Link href="/" data-testid="link-go-home" className={btnInk + " mt-8"}>Back to start</Link>
      </div>
    </Shell>
  );
}
