import { Order } from "./Order";

export class Printer {
  static iframe = null;

  static ensureIframe() {
    if (!this.iframe) {
      this.iframe = document.createElement("iframe");
      this.iframe.style.position = "absolute";
      this.iframe.style.width = "0";
      this.iframe.style.height = "0";
      this.iframe.style.border = "0";
      document.body.appendChild(this.iframe);
    }
    return this.iframe;
  }

  static generateHTML(order) {
    const paymentHTML = order.payment.lines
      .map(line => `<div>${line}</div>`)
      .join("");

    return `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Print</title>
        <style>
          @page { margin: 0; }
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; font-size: 9pt; }
          .order-container { width: 220px; padding: 4px; }
          .order-number { text-align: center; font-size: 12pt; margin-bottom: 6px; }
          .section { margin-bottom: 6px; border-bottom: 1px dashed #262627ff;}
          .payment { margin-top: 6px; }
          .payment-title { text-align: center; font-weight: bold; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <div class="order-container">
          <div class="section">
            <strong>Filial:</strong> ${order.branch}<br/>           
          </div>

          <div class="order-number">Pedido #${order.orderNumber}</div>

          <div class="section">
            <strong>Horário:</strong><br/>
            ${(order.timeInfo || "").replace(/\n/g, "<br/>")}
          </div>

          <div class="section">
            <strong>Cliente:</strong> ${order.custumerName}<br/>            
          </div>

          <div class="section">
            <strong>Localizador:</strong> ${order.locator}<br/>
            <strong>Endereço:</strong><br/>
            ${(order.address || "").replace(/\n/g, "<br/>")}
          </div>

          <div class="section">
            <strong>Entrega:</strong><br/>
            ${(order.deliveryInfo || "").replace(/\n/g, "<br/>")}
          </div>

          <div class="section">
            <strong>Itens:</strong><br/>
            ${order.sodas && order.sodas.length > 0 ? `<div><strong>Refrigerantes:</strong></div>${order.sodas.map(s => `<div class="soda-item" style="margin-bottom:6px; border-bottom: 1px dashed #262627ff; margin-left:10px; font-weight: 700;">- ${s}</div>`).join("")}` : ""}
            ${order.items.map(i => `<div>- ${i}</div>`).join("")}
          </div>

          <div class="section payment">
            <div class="payment-title">Pagamento</div>
            ${paymentHTML}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static printHTML(html) {
    const iframe = this.ensureIframe();
    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return;

    const doc = iframeWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    iframeWindow.focus();
    iframeWindow.print();
  }

  static printOrder(order) {
    const html = this.generateHTML(order);
    this.printHTML(html);
  }
}
