import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

type CheckoutCustomer = {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  city: string;
  address_1: string;
  postcode?: string;
  notes?: string;
};

type CheckoutItem = {
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
};

type EmailOrderPayload = {
  orderId: number;
  customer: CheckoutCustomer;
  items: CheckoutItem[];
  paymentMethod: "cod" | "bacs";
  deliveryMethod: "speedy_office" | "address";
  deliveryOffice?: string;
};

function euro(n: number) {
  return `€${n.toFixed(2)}`;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildDeliveryText(
  deliveryMethod: "speedy_office" | "address",
  deliveryOffice?: string,
  address?: string,
  city?: string
) {
  if (deliveryMethod === "speedy_office") {
    return `Безплатна доставка до офис на Спиди${
      deliveryOffice ? `: ${deliveryOffice}` : ""
    }`;
  }

  return `Доставка до адрес${address ? `: ${address}` : ""}${
    city ? `, ${city}` : ""
  }`;
}

function buildItemsHtml(items: CheckoutItem[]) {
  return items
    .map((it) => {
      const qty = Math.max(1, Number(it.qty) || 1);
      const price = Number(it.price) || 0;
      const rowTotal = qty * price;

      const extras = it.extras || {};
      const rx = extras.rx || {};

      const extraLines: string[] = [];

      if (extras.lensLabel) {
        extraLines.push(`Стъкла: ${escapeHtml(String(extras.lensLabel))}`);
      }

      if (typeof extras.lensPriceAdd === "number") {
        extraLines.push(`Добавка за стъкла: ${euro(extras.lensPriceAdd)}`);
      }

      if (rx.sphR) extraLines.push(`SPH R: ${escapeHtml(String(rx.sphR))}`);
      if (rx.sphL) extraLines.push(`SPH L: ${escapeHtml(String(rx.sphL))}`);
      if (rx.cylR) extraLines.push(`CYL R: ${escapeHtml(String(rx.cylR))}`);
      if (rx.cylL) extraLines.push(`CYL L: ${escapeHtml(String(rx.cylL))}`);
      if (rx.axisR) extraLines.push(`AXIS R: ${escapeHtml(String(rx.axisR))}`);
      if (rx.axisL) extraLines.push(`AXIS L: ${escapeHtml(String(rx.axisL))}`);
      if (rx.pd) extraLines.push(`PD: ${escapeHtml(String(rx.pd))}`);

      return `
<tr>
  <td style="padding:12px;border-bottom:1px solid #eee;vertical-align:top;">
    <div style="font-weight:600">${escapeHtml(it.name || `Продукт #${it.productId}`)}</div>
    ${
      extraLines.length
        ? `<div style="font-size:13px;color:#555;margin-top:6px;line-height:1.5;">${extraLines.join(
            "<br>"
          )}</div>`
        : ""
    }
  </td>
  <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;vertical-align:top;">${qty}</td>
  <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;vertical-align:top;">${euro(
    price
  )}</td>
  <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;vertical-align:top;font-weight:600;">${euro(
    rowTotal
  )}</td>
</tr>`;
    })
    .join("");
}

function buildTotals(items: CheckoutItem[]) {
  const total = items.reduce((sum, it) => {
    const qty = Math.max(1, Number(it.qty) || 1);
    const price = Number(it.price) || 0;
    return sum + qty * price;
  }, 0);

  return { total };
}

function buildCustomerEmailHtml(payload: EmailOrderPayload) {
  const {
    orderId,
    customer,
    items,
    paymentMethod,
    deliveryMethod,
    deliveryOffice,
  } = payload;

  const { total } = buildTotals(items);

  const deliveryText = buildDeliveryText(
    deliveryMethod,
    deliveryOffice,
    customer.address_1,
    customer.city
  );

  const paymentText =
    paymentMethod === "bacs" ? "Банков превод" : "Наложен платеж";

  return `
<div style="font-family:Arial,Helvetica,sans-serif;padding:24px;background:#f7f7f7;color:#111;">
  <div style="max-width:760px;margin:auto;background:#fff;border-radius:16px;padding:28px;border:1px solid #e9e9e9;">
    <h1 style="margin-top:0">Благодарим за поръчката!</h1>

    <p style="margin:0 0 18px 0;">Номер на поръчка: <b>#${orderId}</b></p>

    <h3 style="margin:0 0 12px 0;">Данни за клиента</h3>

    <p style="line-height:1.7;margin:0 0 18px 0;">
      <b>Име:</b> ${escapeHtml(customer.first_name)} ${escapeHtml(
    customer.last_name
  )}<br>
      <b>Телефон:</b> ${escapeHtml(customer.phone)}<br>
      ${customer.email ? `<b>Email:</b> ${escapeHtml(customer.email)}<br>` : ""}
      <b>Град:</b> ${escapeHtml(customer.city)}<br>
      <b>Доставка:</b> ${escapeHtml(deliveryText)}<br>
      <b>Плащане:</b> ${escapeHtml(paymentText)}
      ${
        customer.notes?.trim()
          ? `<br><b>Бележка:</b> ${escapeHtml(customer.notes.trim())}`
          : ""
      }
    </p>

    ${
      paymentMethod === "bacs"
        ? `
    <div style="margin:22px 0;padding:18px;border-radius:14px;background:#fafafa;border:1px solid #e9e9e9;">
      <h3 style="margin:0 0 10px;">Данни за банков превод</h3>
      <div style="font-size:14px;line-height:1.8;color:#333;">
        <div><b>Получател:</b> Оптика Естетика ЕООД</div>
        <div><b>IBAN:</b> BG57BPBI79211046639401</div>
        <div><b>BIC:</b> BPBIBGSF</div>
        <div><b>Банка:</b> Юробанк България АД</div>
        <div><b>Основание:</b> Поръчка #${orderId}</div>
      </div>
      <p style="margin:12px 0 0;font-size:13px;line-height:1.7;color:#666;">
        Поръчката ще бъде обработена след постъпване на плащането.
      </p>
    </div>
    `
        : ""
    }

    <h3 style="margin:22px 0 12px 0;">Поръчани продукти</h3>

    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#fafafa">
          <th style="padding:10px;text-align:left;border-bottom:1px solid #eee;">Продукт</th>
          <th style="padding:10px;text-align:center;border-bottom:1px solid #eee;">Бр.</th>
          <th style="padding:10px;text-align:right;border-bottom:1px solid #eee;">Цена</th>
          <th style="padding:10px;text-align:right;border-bottom:1px solid #eee;">Общо</th>
        </tr>
      </thead>
      <tbody>
        ${buildItemsHtml(items)}
      </tbody>
    </table>

    <div style="margin-top:20px;text-align:right;font-size:20px;font-weight:700;">
      Обща сума: ${euro(total)}
    </div>
  </div>
</div>`;
}

function buildShopEmailHtml(payload: EmailOrderPayload) {
  const {
    orderId,
    customer,
    paymentMethod,
    items,
    deliveryMethod,
    deliveryOffice,
  } = payload;

  const { total } = buildTotals(items);

  const paymentText =
    paymentMethod === "bacs" ? "Банков превод" : "Наложен платеж";

  const deliveryText = buildDeliveryText(
    deliveryMethod,
    deliveryOffice,
    customer.address_1,
    customer.city
  );

  return `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#111;">
  <h2>Нова поръчка #${orderId}</h2>

  <p><b>Клиент:</b> ${escapeHtml(customer.first_name)} ${escapeHtml(
    customer.last_name
  )}</p>

  <p><b>Телефон:</b> ${escapeHtml(customer.phone)}</p>

  ${customer.email ? `<p><b>Email:</b> ${escapeHtml(customer.email)}</p>` : ""}

  <p><b>Град:</b> ${escapeHtml(customer.city)}</p>
  <p><b>Доставка:</b> ${escapeHtml(deliveryText)}</p>
  <p><b>Плащане:</b> ${escapeHtml(paymentText)}</p>
  ${
    customer.notes?.trim()
      ? `<p><b>Бележка:</b> ${escapeHtml(customer.notes.trim())}</p>`
      : ""
  }
  <p><b>Обща сума:</b> ${euro(total)}</p>

  <p>Провери поръчката в WooCommerce за пълните детайли.</p>
</div>`;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "465");
  const secure = String(process.env.SMTP_SECURE || "true") === "true";

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP configuration");
  }

  const options: SMTPTransport.Options = {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  };

  return nodemailer.createTransport(options);
}

export async function sendOrderEmails(payload: EmailOrderPayload) {
  const transporter = getTransporter();

  await transporter.verify();

  const from = process.env.MAIL_FROM || process.env.SMTP_USER || "";
  const shopEmail = process.env.MAIL_TO_SHOP || process.env.SMTP_USER || "";

  const customerEmail = payload.customer.email?.trim();

  if (customerEmail) {
    const info = await transporter.sendMail({
      from,
      to: customerEmail,
      subject: `Поръчка #${payload.orderId} | OnlineOptica`,
      html: buildCustomerEmailHtml(payload),
    });

    console.log("Customer email sent:", info.messageId);
  }

  if (shopEmail) {
    const info = await transporter.sendMail({
      from,
      to: shopEmail,
      subject: `Нова поръчка #${payload.orderId}`,
      html: buildShopEmailHtml(payload),
    });

    console.log("Shop email sent:", info.messageId);
  }
}
