export interface PaymentInfo {
  lines: string[];
  method: "customer" | "ifood" | "unknown";
  collectOnDelivery: boolean;
}

export interface OrderData {
  orderNumber: string;
  custumerName: string;
  branch: string;
  locator: string;
  timeInfo: string;
  deliveryEstimate: string;
  address: string;
  deliveryInfo: string;
  items: string[];
  payment: PaymentInfo;
  notes: string;
}

export class OrderParser {
  static parse(lines: string[]): OrderData {
    const order: OrderData = {
      orderNumber: "",
      custumerName: "",
      branch: "",
      locator: "",
      timeInfo: "",
      deliveryEstimate: "",
      address: "",
      deliveryInfo: "",
      items: [],
      payment: {
        lines: [],
        method: "unknown",
        collectOnDelivery: false
      },
      notes: ""
    };

    const firstLine = lines[0].split(" ");
    order.orderNumber = firstLine[0];
    order.custumerName = firstLine.slice(1).join(" ");

    order.branch = lines[1];

    const locatorLine = lines.find((line) => line.includes("Localizador"));
    if (locatorLine) order.locator = locatorLine;

    const indexViaIFood = lines.findIndex((line) => line.includes("via iFood"));
    const indexItems = lines.findIndex((line) => line.includes("Itens no pedido"));
    const indexServiceFee = lines.findIndex((line) => line.includes("Taxa de serviço"));
    const indexSubtotal = lines.findIndex((line) => line.includes("Subtotal"));

    // Bloco de horários
    let timeBlock: string[] = [];
    for (let i = indexViaIFood; i < indexItems; i++) {
      if (
        lines[i]?.startsWith("R.") ||
        lines[i]?.startsWith("Av.") ||
        lines[i]?.startsWith("Rua") ||
        lines[i]?.startsWith("Avenida")
      )
        break;
      timeBlock.push(lines[i]);
    }
    order.timeInfo = timeBlock.join("\n");

    // Endereço e entrega
    let addressBlock: string[] = [];
    let deliveryBlock: string[] = [];
    let startedAddress = false;
    let afterAddress = false;

    for (let i = 0; i < indexItems; i++) {
      if (
        lines[i]?.startsWith("R.") ||
        lines[i]?.startsWith("Av.") ||
        lines[i]?.startsWith("Rua") ||
        lines[i]?.startsWith("Avenida")
      )
        startedAddress = true;

      if (startedAddress && !afterAddress) {
        addressBlock.push(lines[i]);
        if (lines[i].toLowerCase().includes("entrega própria")) {
          afterAddress = true;
        }
      } else if (afterAddress) {
        deliveryBlock.push(lines[i]);
      }
    }

    order.address = addressBlock.join("\n");
    order.deliveryInfo = deliveryBlock.join("\n");

    // Itens
    const endItemsIndex = indexServiceFee !== -1 ? indexServiceFee : indexSubtotal;

    const highlightKeys: string[] = [
      "Combo 10 Esfihas + Kuat 2l",
      "Coca-Cola 600ml",
      "Refrigerante Coca-Cola Zero Açucar Garrafa 2l",
      "Refrigerante Pepsi 2l",
      "Combo 20 Esfihas de Carne + Coca 2l",
      "Fanta Laranja 2l",
      "Pizza Gigante 50cm + Baby Doce 20cm + Coca 2l",
      "Combo Pizza Família 45cm + Baby Doce 20cm + Kuat 2l",
      "Combo 20 Esfihas + Kuat 2l",
      "Coca-Cola 2l",
      "Coca Cola Zero Lata 350ml",
      "Fanta Laranja Lata",
      "Refrigerante Pepsi Lata 350ml",
      "Sprite Original 2l",
      "Sprite Lata",
      "Guarana Lata",
      "Guarana Diversos - 2l",
      "Refrigerante Guaraná Diversos- 1.5 litros",
      "agua",
      "água"
    ];

    for (let i = indexItems + 1; i < endItemsIndex; i++) {
      let item = lines[i];
      const found = highlightKeys.find((key) =>
        item.toLowerCase().includes(key.toLowerCase())
      );
      if (found) {
        item = `<strong style="font-size:10pt">${item}</strong>`;
      }
      order.items.push(item);
    }

    // Funções auxiliares
    function boldMoney(line: string): string {
      return line.replace(/(-?\s?R\$ ?[\d.,]+)/g, "<strong>$1</strong>");
    }

    function boldTitles(line: string): string {
      return line.replace(/^\s*(Subtotal)\s*$/i, "<strong>$1</strong>");
    }

    // Pagamento
    const paymentStart = indexServiceFee !== -1 ? indexServiceFee : indexSubtotal;

    let paymentBlock: string[] = [];
    for (let i = paymentStart; i < lines.length; i++) {
      let line = lines[i];
      line = boldTitles(line);
      line = boldMoney(line);
      paymentBlock.push(line);
    }

    order.payment.lines = paymentBlock;

    const paymentText = paymentBlock.join(" ");
    if (paymentText.includes("Cobrar do cliente")) {
      order.payment.method = "customer";
    } else if (paymentText.includes("Pago via")) {
      order.payment.method = "ifood";
    } else {
      order.payment.method = "unknown";
    }

    order.payment.collectOnDelivery = paymentText.includes(
      "O entregador deve cobrar este valor"
    );

    // Notas
    const used = new Set<string>([
      ...timeBlock,
      ...addressBlock,
      ...order.items,
      ...paymentBlock,
      lines[0],
      lines[1],
      locatorLine ?? ""
    ]);
    order.notes = lines.filter((l) => !used.has(l)).join("\n");

    return order;
  }
}