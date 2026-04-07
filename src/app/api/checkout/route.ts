import { NextResponse } from "next/server";
import { getOoToken } from "@/lib/ooSession";
import { sendOrderEmails } from "@/lib/email";

export const runtime = "nodejs";

type CheckoutBody = {
  customer: {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    city: string;
    address_1: string;
    postcode?: string;
    notes?: string;
  };
  payment?: {
    method?: "cod" | "bacs";
  };
  delivery?: {
    method?: "speedy_office" | "address";
    officeId?: number;
    officeName?: string;
    siteId?: number;
    siteName?: string;
  };
  items: {
    productId: number;
    qty: number;
    name?: string;
    price?: number;
    extras?: {
      lensLabel?: string;
      lensPriceAdd?: number;
      rx?: {
        sphR?: string;
        sphL?: string;
        cylR?: string;
        cylL?: string;
        axisR?: string;
        axisL?: string;
        pd?: string;
      };
    };
  }[];
};

function appendWooAuth(url: URL) {
  const ck = process.env.WOO_CONSUMER_KEY;
  const cs = process.env.WOO_CONSUMER_SECRET;

  if (!ck || !cs) {
    throw new Error("Missing WOO_CONSUMER_KEY or WOO_CONSUMER_SECRET");
  }

  url.searchParams.set("consumer_key", ck);
  url.searchParams.set("consumer_secret", cs);
  return url;
}

function asMoney(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Email timeout after ${ms}ms`)), ms);
    }),
  ]);
}

export async function POST(req: Request) {
  try {
    const baseUrl = process.env.WOO_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Missing WOO_BASE_URL" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as CheckoutBody;

    if (!body?.items?.length) {
      return NextResponse.json({ error: "Empty cart" }, { status: 400 });
    }

    const token = await getOoToken();
    let customerId: number | undefined;

    if (token) {
      try {
        const meRes = await fetch(`${baseUrl}/wp-json/onlineoptica/v1/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (meRes.ok) {
          const me = await meRes.json().catch(() => null);
          const maybeId = me?.user?.id;
          if (typeof maybeId === "number") {
            customerId = maybeId;
          }
        }
      } catch (e) {
        console.warn("Failed to fetch logged-in user:", e);
      }
    }

    const line_items = body.items.map((it) => {
      const extras = it.extras || {};
      const rx = extras.rx || {};

      const meta_data = [
        extras.lensLabel
          ? { key: "Стъкла", value: String(extras.lensLabel) }
          : null,

        typeof extras.lensPriceAdd === "number"
          ? {
              key: "Добавка за стъкла",
              value: `${asMoney(extras.lensPriceAdd)} €`,
            }
          : null,

        rx.sphR ? { key: "SPH R", value: String(rx.sphR) } : null,
        rx.sphL ? { key: "SPH L", value: String(rx.sphL) } : null,
        rx.cylR ? { key: "CYL R", value: String(rx.cylR) } : null,
        rx.cylL ? { key: "CYL L", value: String(rx.cylL) } : null,
        rx.axisR ? { key: "AXIS R", value: String(rx.axisR) } : null,
        rx.axisL ? { key: "AXIS L", value: String(rx.axisL) } : null,
        rx.pd ? { key: "PD", value: String(rx.pd) } : null,
      ].filter(Boolean);

      const qty = Math.max(1, Number(it.qty) || 1);
      const unitPrice = Number(it.price) || 0;
      const lineTotal = unitPrice * qty;

      return {
        product_id: it.productId,
        quantity: qty,
        subtotal: asMoney(lineTotal),
        total: asMoney(lineTotal),
        ...(meta_data.length ? { meta_data } : {}),
      };
    });

    const deliveryMethod = body.delivery?.method || "address";
    const deliveryOfficeName = (body.delivery?.officeName || "").trim();
    const deliveryOfficeId = body.delivery?.officeId;
    const deliverySiteName = (body.delivery?.siteName || "").trim();

    const deliveryText =
      deliveryMethod === "speedy_office"
        ? `Безплатна доставка до офис на Спиди${
            deliveryOfficeName ? `: ${deliveryOfficeName}` : ""
          }${deliverySiteName ? `, ${deliverySiteName}` : ""}${
            deliveryOfficeId ? ` (ID: ${deliveryOfficeId})` : ""
          }`
        : "Доставка до адрес - за сметка на клиента, плаща се директно на Спиди";

    const noteParts = [
      `Метод на доставка: ${deliveryText}`,
      body.customer.notes?.trim() || "",
    ].filter(Boolean);

    const paymentMethod = body.payment?.method === "bacs" ? "bacs" : "cod";

    const shippingAddress =
      deliveryMethod === "address"
        ? body.customer.address_1
        : [deliveryOfficeName, deliverySiteName].filter(Boolean).join(", ");

    const orderPayload = {
      payment_method: paymentMethod,
      payment_method_title:
        paymentMethod === "bacs" ? "Банков превод" : "Наложен платеж",
      set_paid: false,

      ...(customerId ? { customer_id: customerId } : {}),

      billing: {
        first_name: body.customer.first_name,
        last_name: body.customer.last_name,
        address_1: shippingAddress,
        city: body.customer.city,
        postcode: body.customer.postcode || "",
        country: "BG",
        email: body.customer.email || "",
        phone: body.customer.phone,
      },

      shipping: {
        first_name: body.customer.first_name,
        last_name: body.customer.last_name,
        address_1: shippingAddress,
        city: body.customer.city,
        postcode: body.customer.postcode || "",
        country: "BG",
      },

      customer_note: noteParts.join("\n"),
      line_items,
      meta_data: [
        { key: "_delivery_method", value: deliveryMethod },
        { key: "_speedy_office_id", value: deliveryOfficeId || "" },
        { key: "_speedy_office_name", value: deliveryOfficeName || "" },
        { key: "_speedy_site_name", value: deliverySiteName || "" },
      ],
    };

    const url = appendWooAuth(new URL(`${baseUrl}/wp-json/wc/v3/orders`));

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Woo order failed", details: text },
        { status: 500 }
      );
    }

    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Woo returned invalid JSON", details: text },
        { status: 500 }
      );
    }

    let emailSent = false;
    let emailError: string | null = null;

    try {
      await withTimeout(
        sendOrderEmails({
          orderId: json.id,
          customer: body.customer,
          items: body.items,
          paymentMethod,
          deliveryMethod,
          deliveryOffice: [deliveryOfficeName, deliverySiteName]
            .filter(Boolean)
            .join(", "),
        }),
        6000
      );

      emailSent = true;
    } catch (e: any) {
      emailError = e?.message || String(e);
      console.error("Order created, but custom email failed:", e);
    }

    return NextResponse.json({
      ok: true,
      order_id: json.id,
      customer_id: customerId ?? null,
      payment_method: paymentMethod,
      email_sent: emailSent,
      email_error: emailError,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Checkout route failed", details: e?.message || String(e) },
      { status: 500 }
    );
  }
}
