"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { cartService } from "@/services/cart.service";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import type { CartWithItems } from "@/types/cart";

const schema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address_line1: z.string().min(5, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postal_code: z.string().min(6, "Valid postal code is required"),
  country: z.string().default("India"),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { total } = useCartStore();
  const { data: cartDataRaw } = useCart();
  const cartData = cartDataRaw as CartWithItems | null | undefined;
  const { mutate: createOrder, isPending } = useCreateOrder();

  const cartTotal = total();
  const shippingAmount = cartTotal >= 999 ? 0 : 99;
  const grandTotal = cartTotal + shippingAmount;

  const items = cartData?.cart_items ?? [];

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: "India" },
  });

  const onSubmit = async (data: FormData) => {
    if (!user || !cartData || items.length === 0) return;

    createOrder(
      [
        {
          user_id: user.id,
          status: "pending",
          total_amount: grandTotal,
          shipping_amount: shippingAmount,
          payment_method: "cod",
          payment_status: "pending",
          notes: null,
        },
        {
          full_name: data.fullName,
          phone: data.phone,
          address_line1: data.address_line1,
          address_line2: data.address_line2 ?? null,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country,
          is_default: false,
        },
        items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.products.price,
        })),
      ],
      {
        onSuccess: async (order) => {
          if (cartData?.id) await cartService.clearCart(cartData.id);
          router.push(`/dashboard/orders/${order.id}?success=true`);
        },
      }
    );
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <Button onClick={() => router.push("/products")} className="mt-4">
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Address Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="John Doe" {...register("fullName")} />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+91 9999999999" {...register("phone")} />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="address_line1">Address Line 1</Label>
                  <Input id="address_line1" placeholder="House/Flat No, Building, Street" {...register("address_line1")} />
                  {errors.address_line1 && <p className="text-xs text-destructive">{errors.address_line1.message}</p>}
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                  <Input id="address_line2" placeholder="Area, Colony, Landmark" {...register("address_line2")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Mumbai" {...register("city")} />
                  {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="Maharashtra" {...register("state")} />
                  {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input id="postal_code" placeholder="400001" {...register("postal_code")} />
                  {errors.postal_code && <p className="text-xs text-destructive">{errors.postal_code.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" defaultValue="India" {...register("country")} />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-primary/5 border-primary">
                  <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Place Order — {formatPrice(grandTotal)}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-64 overflow-auto">
                {items.map((item) => {
                  const img = item.products.product_images?.find((i) => i.is_primary) ?? item.products.product_images?.[0];
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-14 w-14 rounded-md overflow-hidden bg-muted shrink-0">
                        {img && <Image src={img.url} alt={item.products.name} fill className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.products.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium shrink-0">
                        {formatPrice(item.quantity * item.products.price)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingAmount === 0 ? "Free" : formatPrice(shippingAmount)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
