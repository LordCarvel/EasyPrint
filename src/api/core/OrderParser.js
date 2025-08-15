export class OrderParser {
  static parse(lines) {
    const order = {
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
      notes: "",
      sodas: []
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

    let timeBlock = [];
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
    let addressBlock = [];
    let deliveryBlock = [];
    let startedAddress = false;
    let afterAddress = false;
    let addressEndIndex = -1;

    for (let i = 0; i < indexItems; i++) {
      const line = lines[i];
      if (
        line?.startsWith("R.") ||
        line?.startsWith("Av.") ||
        line?.startsWith("Rua") ||
        line?.startsWith("Avenida")
      ) {
        startedAddress = true;
        if (addressBlock.length === 0) addressEndIndex = i;
      }

      if (startedAddress && !afterAddress) {
        addressBlock.push(line);
        if (line.includes("Entrega própria") || line.includes("Retirada")) {
          afterAddress = true;
          addressEndIndex = i;
        }
      } else if (afterAddress) {
        deliveryBlock.push(line);
      }
    }

    order.address = addressBlock.join("\n");
    order.deliveryInfo = deliveryBlock.join("\n");

    const sodaKeys = [
      "Coca-Cola 600ml",
      "Refrigerante Coca-Cola Zero Açucar Garrafa 2l",
      "Refrigerante Pepsi 2l",
      "Fanta Laranja 2l",
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
      "água",
      "Kuat 2l",
      "Coca-Cola Lata 350ml",
      "Combo 10 Esfihas + Kuat 2l",
      "Combo 20 Esfihas de Carne + Coca 2l",
      "Pizza Gigante 50cm + Baby Doce 20cm + Coca 2l",
      "Combo Pizza Família 45cm + Baby Doce 20cm + Kuat 2l",
      "Combo 20 Esfihas + Kuat 2l"
    ];

    let endItemsIndex;
    if (indexServiceFee !== -1) {
      endItemsIndex = indexServiceFee;
    } else if (indexSubtotal !== -1) {
      endItemsIndex = indexSubtotal;
    } else {
      endItemsIndex = lines.length;
    }

    const sodas = [];
    const items = [];

    for (let i = indexItems + 1; i < endItemsIndex; i++) {
      let item = lines[i];
      const itemWithoutTags = item.replace(/<[^>]+>/g, '');
      const itemWithoutPrice = itemWithoutTags.replace(/\s*R\$[\d,.]+$/, "").trim();

      const isSoda = sodaKeys.some(
        key => itemWithoutPrice.toLowerCase() === key.toLowerCase()
      );

      if (isSoda) {
        sodas.push(boldMoney(boldTitles(item)));
      } else {
        let itemWithBoldSoda = item;
        sodaKeys.forEach(key => {
          const regex = new RegExp(`(${key})`, "gi");
          itemWithBoldSoda = itemWithBoldSoda.replace(regex, "<strong>$1</strong>");
        });
        items.push(boldMoney(boldTitles(itemWithBoldSoda)));
      }
    }

    order.items = items;
    order.sodas = sodas;

    function boldMoney(line) {
      return line.replace(/(-?\s?R\$ ?[\d.,]+)/g, "<strong>$1</strong>");
    }

    function boldTitles(line) {
      return line.replace(/^\s*(Subtotal)\s*$/i, "<strong>$1</strong>");
    }

    const paymentStart = indexServiceFee !== -1 ? indexServiceFee : indexSubtotal;

    let paymentBlock = [];
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

    const used = new Set([
      ...timeBlock,
      ...addressBlock,
      ...order.items,
      ...order.sodas,
      ...paymentBlock,
      lines[0],
      lines[1],
      locatorLine ?? ""
    ]);
    order.notes = lines.filter((l, idx) => !used.has(l) && idx > addressEndIndex).join("\n");

    return order;
  }
}