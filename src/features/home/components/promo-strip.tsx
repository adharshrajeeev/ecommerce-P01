import { Truck, RotateCcw, Shield, Headphones } from "lucide-react";

const PERKS = [
  { icon: Truck, label: "Free Delivery", sub: "On orders above ₹999" },
  { icon: RotateCcw, label: "Easy Returns", sub: "30-day return policy" },
  { icon: Shield, label: "Secure Payment", sub: "100% safe & secure" },
  { icon: Headphones, label: "24/7 Support", sub: "Dedicated help center" },
];

export function PromoStrip() {
  return (
    <section className="border-y border-border bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          {PERKS.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 py-4 px-3 md:px-6">
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-semibold text-foreground truncate">{label}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
