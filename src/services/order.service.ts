import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type AddressInsert = Database["public"]["Tables"]["addresses"]["Insert"];

const supabase = createClient();

const ORDER_SELECT = `
  *,
  order_items(
    *,
    products(
      *,
      product_images(*),
      categories(*)
    )
  ),
  addresses(*)
`;

export const orderService = {
  async getUserOrders(userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getOrderById(orderId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("id", orderId)
      .single();
    if (error) throw error;
    return data;
  },

  async getAllOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(`${ORDER_SELECT}, users(full_name, email)`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async createOrder(
    order: Omit<OrderInsert, "address_id">,
    addressData: Omit<AddressInsert, "user_id">,
    items: { product_id: string; quantity: number; unit_price: number }[]
  ): Promise<Database["public"]["Tables"]["orders"]["Row"]> {
    // Upsert address
    const { data: address, error: addrError } = await supabase
      .from("addresses")
      .insert({ ...addressData, user_id: order.user_id })
      .select()
      .single();
    if (addrError) throw addrError;

    // Create order
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({ ...order, address_id: address.id })
      .select()
      .single();
    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);
    if (itemsError) throw itemsError;

    return newOrder;
  },

  async updateOrderStatus(
    orderId: string,
    status: Database["public"]["Tables"]["orders"]["Row"]["status"]
  ) {
    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getUserAddresses(userId: string) {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getAdminStats() {
    const [ordersRes, productsRes, usersRes] = await Promise.all([
      supabase.from("orders").select("id, total_amount, status"),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }),
    ]);

    const orders = ordersRes.data ?? [];
    const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

    return {
      totalOrders: orders.length,
      totalProducts: productsRes.count ?? 0,
      totalUsers: usersRes.count ?? 0,
      totalRevenue,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
    };
  },
};
