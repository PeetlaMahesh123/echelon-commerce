import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No stripe signature");
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    let event: Stripe.Event;
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For development without webhook secret
      event = JSON.parse(body);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Get line items from the session
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      // Calculate total
      const total = lineItems.data.reduce((sum, item) => {
        return sum + (item.amount_total || 0);
      }, 0) / 100;

      // Get user from customer email
      let userId = null;
      const customerEmail = session.customer_email || session.customer_details?.email;
      
      if (customerEmail) {
        const { data: user } = await supabaseClient
          .from("profiles")
          .select("user_id")
          .eq("user_id", supabaseClient.auth.getUser().then(u => u.data.user?.id || ""))
          .single();
        
        // Try to find user by email in auth.users
        const { data: { users } } = await supabaseClient.auth.admin.listUsers();
        const foundUser = users.find(u => u.email === customerEmail);
        if (foundUser) {
          userId = foundUser.id;
        }
      }

      // Create order
      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .insert({
          user_id: userId,
          status: "confirmed",
          total: total,
          shipping_name: session.shipping_details?.name,
          shipping_email: customerEmail,
          shipping_address: session.shipping_details?.address?.line1,
          shipping_city: session.shipping_details?.address?.city,
          shipping_postal_code: session.shipping_details?.address?.postal_code,
          shipping_country: session.shipping_details?.address?.country,
          stripe_payment_id: session.payment_intent as string || session.id,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        throw orderError;
      }

      // Create order items
      for (const item of lineItems.data) {
        await supabaseClient.from("order_items").insert({
          order_id: order.id,
          product_name: item.description || "Unknown Product",
          price: (item.amount_total || 0) / 100,
          quantity: item.quantity || 1,
        });
      }

      console.log("Order created successfully:", order.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
