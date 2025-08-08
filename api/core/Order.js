export class Order {
  constructor ({
    orderNumber = "",
    custumerName = "",
    branch = "",
    locator = "",
    timeInfo = "",
    deliveryEstimate = "",
    address = "",
    deliveryInfo = "",
    items = [],
    payment = { lines: [], method: "unknown", collectOnDelivery: false },
    notes = ""
  } = {}) {

    this.orderNumber = orderNumber;
    this.custumerName = custumerName;
    this.branch = branch;
    this.locator = locator;
    this.timeInfo = timeInfo;
    this.deliveryEstimate = deliveryEstimate;
    this.address = address;
    this.deliveryInfo = deliveryInfo;
    this.items = Array.isArray(items) ? [...items] : [];

    this.payment = {
      lines: Array.isArray(payment.lines) ? [...payment.lines] : [],
      method: payment.method || "unknown",
      collectOnDelivery: Boolean(payment.collectOnDelivery)
    };

    this.notes = notes;
  }

  static fromParsed (parsed) {
    return new Order(parsed);
  }

  isPaidViaIfood () {
    return this.payment.method === "ifood";
  }

  isPaidByCustomer () {
    return this.payment.method === "customer";
  }

  isCollectOnDelivery () {
    return this.payment.collectOnDelivery;
  }

  hasItems () {
    return this.items.length > 0;
  }

  hasDeliveryInfo () {
    return Boolean(this.deliveryInfo && this.deliveryInfo.trim());
  }

  toPlainObject () {
    return {
      orderNumber: this.orderNumber,
      custumerName: this.custumerName,
      branch: this.branch,
      locator: this.locator,
      timeInfo: this.timeInfo,
      deliveryEstimate: this.deliveryEstimate,
      address: this.address,
      deliveryInfo: this.deliveryInfo,
      items: [...this.items],
      payment: { ...this.payment },
      notes: this.notes
    };
  }

  summary () {
    const itemsCount = this.items.length;
    const pay = this.payment.method;
    const cod = this.payment.collectOnDelivery ? " + cobrar na entrega" : "";
    
    return `#${this.orderNumber} ${this.custumerName} @ ${this.branch} — ${itemsCount} item(s), pagamento: ${pay}${cod}`;
  }
}